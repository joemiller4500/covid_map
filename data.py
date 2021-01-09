# import dependencies 
import pandas as pd
import geopandas as gpd

# import daily covid data from git repository
# from Johns Hopkins
tsConfUS = pd.read_csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv')
tsConfUS['FIPS'] = tsConfUS['FIPS'].fillna(0)
# pad the fips code with leading zero if necessary
tsConfUS['FIPS'] = tsConfUS['FIPS'].astype(int).astype(str).str.pad(width = 5, side='left', fillchar='0')
latlongs = tsConfUS[['FIPS','Lat','Long_']]
print(latlongs)

# import census data
censusTot = pd.read_csv('https://www2.census.gov/programs-surveys/popest/datasets/2010-2019/counties/totals/co-est2019-alldata.csv', encoding = "ISO-8859-1")
# create FIPS code by merging state and county
# codes, padding with leading zero(s) where necessary
censusTot['FIPS'] = censusTot['STATE'].astype(str).str.pad(width = 2, side='left', fillchar='0') + censusTot['COUNTY'].astype(str).str.pad(width = 3, side='left', fillchar='0')
censusTot = censusTot[['FIPS', 'POPESTIMATE2019']]

voteCount = pd.read_csv('countypres_2000-2016.csv')
voteCount = voteCount[(voteCount['year'] == 2016)]
# print(voteCount)
voteCount = voteCount[(voteCount['candidate'] == 'Donald Trump')]
voteCount['FIPS'] = voteCount['FIPS'].fillna(0)
voteCount['FIPS'] = voteCount['FIPS'].astype(int).astype(str).str.pad(width = 5, side='left', fillchar='0')
voteCount = voteCount[['FIPS', 'candidatevotes', 'totalvotes']]
# print(voteCount)

# read in shapefile with GeoPandas and rename FIPS key
usgeo = gpd.read_file("geo_data/cb_2014_us_county_5m.shp")
usgeo['FIPS'] = usgeo['GEOID']

# merge all data into geopandas Dataframe from Pandas
# Dataframes
usgeo = usgeo.merge(tsConfUS, on = 'FIPS')
usgeo = usgeo.merge(censusTot, on = 'FIPS')
voteCount = voteCount.merge(latlongs,how='left', on = 'FIPS').dropna()
print(voteCount)


# calculate fields to be used in JavaScript map
usgeo['last'] = usgeo.iloc[:,-2]
usgeo['rate'] = (usgeo['last'] - usgeo.iloc[:,-31])/(30*(usgeo['POPESTIMATE2019']))
usgeo['rate'] = usgeo['rate'].round(decimals = 6)
usgeo['new'] = (usgeo['last'] - usgeo.iloc[:,-8])
usgeo = usgeo[['NAME','FIPS','geometry','rate','last', 'POPESTIMATE2019','Lat','Long_', 'new']]
usgeo['perc'] = (usgeo['last']/usgeo['POPESTIMATE2019']).round(decimals = 4)

# use GeoPandas to export the dataframe to a GeoJSON file
usgeo.to_file("usgeo.geojson", driver='GeoJSON')
voteCount.to_csv("voteCount.csv")