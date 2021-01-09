import pandas as pd
import geopandas as gpd
# import numpy as np
from osgeo import ogr
# import os


tsConfUS = pd.read_csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv')
tsConfUS['FIPS'] = tsConfUS['FIPS'].fillna(0)
tsConfUS['FIPS'] = tsConfUS['FIPS'].astype(int).astype(str).str.pad(width = 5, side='left', fillchar='0')
censusTot = pd.read_csv('https://www2.census.gov/programs-surveys/popest/datasets/2010-2019/counties/totals/co-est2019-alldata.csv', encoding = "ISO-8859-1")
censusTot['FIPS'] = censusTot['STATE'].astype(str).str.pad(width = 2, side='left', fillchar='0') + censusTot['COUNTY'].astype(str).str.pad(width = 3, side='left', fillchar='0')
censusTot = censusTot[['FIPS', 'POPESTIMATE2019']]
# print(censusTot)
# print(tsConfUS['GEOID'][0])
usgeo = gpd.read_file("cb_2014_us_county_5m.shp")
usgeo['FIPS'] = usgeo['GEOID']

usgeo = usgeo.merge(tsConfUS, on = 'FIPS')
# print(type(usgeo['FIPS'][0]))
# print(type(censusTot['FIPS'][0]))
usgeo = usgeo.merge(censusTot, on = 'FIPS')
# print(usgeo)


usgeo['last'] = usgeo.iloc[:,-2]
usgeo['rate'] = (usgeo['last'] - usgeo.iloc[:,-8])/(7*(usgeo['last'] + usgeo.iloc[:,-8]/2))
usgeo['rate'] = usgeo['rate'].round(decimals = 4)
usgeo = usgeo[['NAME','FIPS','geometry','rate','last', 'POPESTIMATE2019','Lat','Long_']]
usgeo['perc'] = (usgeo['last']/usgeo['POPESTIMATE2019']).round(decimals = 4)
print(usgeo)
# print(usgeo[["perc"]].describe())

usgeo.to_file("usgeo.geojson", driver='GeoJSON')

