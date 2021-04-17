# import dependencies 
import pandas as pd
import geopandas as gpd
import numpy as np
import json
import datetime

# read in COVID-19 confirmed cases file
tsConfUS = pd.read_csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_US.csv')
tsConfUS['FIPS'] = tsConfUS['FIPS'].fillna(0)
tsConfUS = tsConfUS[(tsConfUS['Province_State'] != 'Alaska')]
tsConfUS = tsConfUS[(tsConfUS['Admin2'] != 'Unassigned')]
# preprocess some of the dates to be used later with datetime library
datesArray = []
i=0
lastDate = tsConfUS.columns[-1]
splitter = lastDate.split('/')
month = splitter[0].zfill(2)
day = splitter[1].zfill(2)
out = splitter[2] + '-' + month + '-' + day
lastDate = datetime.datetime.strptime(out, '%y-%m-%d')
dateStrings = []
dateStrings.append(tsConfUS.columns[-1])
for j in range(1,7):
    curr = lastDate - datetime.timedelta(days=j)
    curr = datetime.datetime.strftime(curr, '%y-%m-%d')
    splitter = curr.split('-')
    split1 = splitter[1]
    split2 = splitter[2]
    if (split1[0] == '0'):
        month = split1[1]
    else:
        month = splitter[1]
    if (split2[0] == '0'):
        day = split2[1]
    else:
        day = splitter[2]
    date = str(month + '/' + day + '/' + splitter[0])
    dateStrings.append(date)
for item in tsConfUS.columns:
    if (i>10):
        splitter = item.split('/')
        year = '20' + splitter[2]
        month = splitter[0].zfill(2)
        day = splitter[1].zfill(2)
        out = year + '-' + month + '-' + day
        datesArray.append(out)
    i+=1

i=0
for item in dateStrings:
    string = str(i) + 'ago'
    tsConfUS.rename(columns={item:string},inplace=True)
    i+=1
# export json file with dates in format usable by Plotly.js
with open("static/data/dates.json", 'w') as outfile:
    json.dump(datesArray, outfile)
# pad the fips code with leading zero if necessary
tsConfUS['FIPS'] = tsConfUS['FIPS'].astype(int).astype(str).str.pad(width = 5, side='left', fillchar='0')
tsConfUS.sort_values(['FIPS'],inplace=True)
fipsy = tsConfUS['FIPS']
# subtract previous values from confirmed cases in order to 
# produce series representing new cases
allDates = []
for index, row in tsConfUS.iterrows():
    dates = []
    last = row[11]
    for i in range(11,(len(row))):
        if (i > 12):
            dates.append(row[i]-last)
            last = row[i]
        else:
            dates.append(row[i])
    allDates.append(dates)
# create a single array of all new case values for each county
# in order to plot counties individually
keyed = {}
for i in range(0,(len(fipsy))):
    keyed.update({fipsy.values[i]: np.asarray(allDates[i])})
tsConfFIPS = pd.DataFrame.from_dict(keyed, orient='index')
tsConfFIPS['new'] = tsConfFIPS.apply(lambda r: tuple(r), axis=1).apply(np.array)
tsConfFIPS = tsConfFIPS['new'].reset_index()
tsConfFIPS.rename(columns={'index': 'FIPS', 'new': 'timeseries'},inplace=True)

# read in and process COVID-19 death statistics
tsDeathUS = pd.read_csv('https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_US.csv')
tsDeathUS['FIPS'] = tsDeathUS['FIPS'].fillna(0)
tsDeathUS = tsDeathUS[(tsDeathUS['Province_State'] != 'Alaska')]

tsDeathUS = tsDeathUS[(tsDeathUS['Admin2'] != 'Unassigned')]
tsDeathUS['FIPS'] = tsDeathUS['FIPS'].astype(int).astype(str).str.pad(width = 5, side='left', fillchar='0')
tsDeathUS.sort_values(['FIPS'],inplace=True)
fipsyD = tsDeathUS['FIPS']
allDatesD = []
for index, row in tsDeathUS.iterrows():
    dates = []
    last = row[12]
    for i in range(12,(len(row))):
            dates.append(row[i])
    allDatesD.append(dates)
keyed = {}
for i in range(0,(len(fipsyD))):
    keyed.update({fipsyD.values[i]: np.asarray(allDatesD[i])})
tsDeathFIPS = pd.DataFrame.from_dict(keyed, orient='index')
tsDeathFIPS['new'] = tsDeathFIPS.apply(lambda r: tuple(r), axis=1).apply(np.array)
tsDeathFIPS = tsDeathFIPS['new'].reset_index()
tsDeathFIPS.rename(columns={'index': 'FIPS', 'new': 'timeseriesD'},inplace=True)

# import census total population data
censusTot = pd.read_csv('https://www2.census.gov/programs-surveys/popest/datasets/2010-2019/counties/totals/co-est2019-alldata.csv', encoding = "ISO-8859-1")
censusTot = censusTot[(censusTot['STNAME'] != 'Alaska')]
censusTot['FIPS'] = censusTot['STATE'].astype(str).str.pad(width = 2, side='left', fillchar='0') + censusTot['COUNTY'].astype(str).str.pad(width = 3, side='left', fillchar='0')
censusTot = censusTot[['FIPS', 'POPESTIMATE2019']]

# census race/origin by county data
censusRace = pd.read_csv('static/data/co-est00int-sexracehisp.csv', encoding = "ISO-8859-1")
censusRace = censusRace[(censusRace['STNAME'] != 'Alaska')]
censusRace['FIPS'] = censusRace['STATE'].astype(str).str.pad(width = 2, side='left', fillchar='0') + censusRace['COUNTY'].astype(str).str.pad(width = 3, side='left', fillchar='0')
censusRace = censusRace[['FIPS','SEX','ORIGIN','RACE','POPESTIMATE2010']]
raceGrouped = censusRace.groupby(['FIPS','ORIGIN','RACE']).agg({'POPESTIMATE2010':'sum'}).reset_index('FIPS')
fipsList = raceGrouped.FIPS.unique()
allData = []
allHisp = []
for item in fipsList:
    dataset = censusRace[(censusRace['FIPS'] == item)]
    dataset = dataset[(dataset['SEX'] == 0)]
    tot = dataset[(dataset['ORIGIN'] == 0)]
    hisp = dataset[(dataset['ORIGIN'] == 2)]
    tot = tot['POPESTIMATE2010'].head(1).values[0]
    hisp = hisp['POPESTIMATE2010'].head(1).values[0]
    hisp = 100%(hisp/tot).round(decimals = 2)
    allHisp.append(hisp)
    data = []  
    for i in range (1,7): 
        data.append(dataset['POPESTIMATE2010'].values[i])
    allData.append(data)
allData = pd.DataFrame(allData,columns=['WHT','AA','AI','AS','PI','MX'])
allData['FIPS'] = fipsList
allData['HISP'] = allHisp

# census age by county data
censusAge = pd.read_csv('static/data/co-est00int-agesex-5yr.csv', encoding = "ISO-8859-1")
censusAge = censusAge[(censusAge['STNAME'] != 'Alaska')]
censusAge['FIPS'] = censusAge['STATE'].astype(str).str.pad(width = 2, side='left', fillchar='0') + censusAge['COUNTY'].astype(str).str.pad(width = 3, side='left', fillchar='0')

# logic to produce voteCount from imported csv
voteCount = pd.read_csv('static/data/countypres_2000-2016.csv')
voteCount = voteCount[(voteCount['state'] != 'Alaska')]
voteCount = voteCount[(voteCount['FIPS'].notna() & voteCount['candidatevotes'].notna())]
zeros = voteCount['FIPS'].astype(int)
voteCount = voteCount[(voteCount['year'] == 2016)]
voteCount['FIPS'] = voteCount['FIPS'].fillna(0)
voteCount['FIPS'] = voteCount['FIPS'].astype(int).astype(str).str.pad(width = 5, side='left', fillchar='0')
fipsy = voteCount['FIPS']
voteCount = voteCount[(voteCount['FIPS'].astype(int) < 2001) | (voteCount['FIPS'].astype(int) > 3000)]
fipsy = voteCount['FIPS']
candy = voteCount['candidate']
dtBinary = []
hcBinary = []
otherBinary = []
for item in candy:
    if (item == 'Donald Trump'):
        dtBinary.append(1)
        hcBinary.append(0)
        otherBinary.append(0)
    elif (item == 'Hillary Clinton'):
        dtBinary.append(0)
        hcBinary.append(1)
        otherBinary.append(0)
    else:
        dtBinary.append(0)
        hcBinary.append(0)
        otherBinary.append(1)
dtVotes = (dtBinary*voteCount['candidatevotes']).values
dtVotes = dtVotes[dtVotes.astype(int) != 0]
hcVotes = (hcBinary*voteCount['candidatevotes']).values
otherVotes = (otherBinary*voteCount['candidatevotes']).values
dtVotes = dtVotes[dtVotes.astype(int) != 0]
hcVotes = hcVotes[hcVotes != 0]
otherVotes = otherVotes[otherVotes != 0]
voteCount = voteCount.groupby(['FIPS']).agg({'totalvotes':'mean'})
voteCount['trumpVotes'] = dtVotes
voteCount['clintonVotes'] = hcVotes
voteCount['otherVotes'] = otherVotes

# read in shapefile with GeoPandas and rename FIPS key
usgeo = gpd.read_file("static/data/geo_data/cb_2014_us_county_5m.shp")

usgeo['FIPS'] = usgeo['GEOID']

# merge all data into geopandas Dataframe from Pandas
# Dataframes
usgeo = usgeo.merge(tsConfUS, on = 'FIPS')
usgeo = usgeo.merge(censusTot, on = 'FIPS')
usgeo = usgeo.merge(allData, on = 'FIPS')
usgeo = usgeo.merge(voteCount, on = 'FIPS')
usgeo = usgeo.merge(tsConfFIPS, on = 'FIPS')
usgeo = usgeo.merge(tsDeathFIPS, on = 'FIPS')
usgeo.sort_values(['FIPS'],inplace=True)

# calculate fields to be used in JavaScript map
usgeo['lastC'] = usgeo['0ago']
usgeo['rateC'] = (usgeo['0ago'] - usgeo['6ago'])/(7*(usgeo['POPESTIMATE2019']))
usgeo['rateC'] = usgeo['rateC'].round(decimals = 6)
usgeo['newC'] = (usgeo['0ago'] - usgeo['6ago'])
usgeo['perten'] = (10000*usgeo['newC']/usgeo['POPESTIMATE2019']).round(decimals = 5)

# remove arrays from the file that will become
# our GeoJSON as they are not supported. These 
# will be exported separately
tsConfFIPS = pd.DataFrame(data = {'NAME':usgeo['NAME'], 'FIPS':usgeo['FIPS']})
tsConfFIPS['timeseries'] = usgeo['timeseries']
tsConfFIPS.set_index('FIPS', inplace=True, drop=True)
tsConfFIPS.drop(labels='NAME', axis=1, inplace=True)

tsDeathFIPS = pd.DataFrame(data = {'NAME':usgeo['NAME'], 'FIPS':usgeo['FIPS']})
tsDeathFIPS['timeseries'] = usgeo['timeseriesD']
tsDeathFIPS.set_index('FIPS', inplace=True, drop=True)
tsDeathFIPS.drop(labels='NAME', axis=1, inplace=True)

# remove unnecessary columns and export all files
# to be used in visualization
usgeo = usgeo[['NAME','FIPS','geometry', 'Province_State', 'POPESTIMATE2019','rateC','lastC','newC','perten','WHT','AA','AI','AS','PI','MX', 'HISP','trumpVotes','clintonVotes','otherVotes']]
tsConfFIPS.to_json("static/data/confirmedTS.json", orient="columns")
tsDeathFIPS.to_json("static/data/deathsTS.json", orient="columns")
usgeo.to_file("static/data/usgeo.geojson", driver='GeoJSON')

# uncomment in order to push new voteCount.csv file,
# not necessary to update until 2020 results are published
# voteCount.to_csv("static/data/voteCount.csv")