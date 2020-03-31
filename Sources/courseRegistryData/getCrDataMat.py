#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
########################################################################
Created on Wed Mar 25 12:36:44 2020

A script to count co-occurences of the keywords for disciplines, objects,
and techniques used in all the recent courses of the DH Course Registry.
Data is harvested via the DHCR API and then transformed into a dictionary,
which is further printed into a JSON file for further use.

Envisaged output:
{
	"Archaeology":
			{"coocurrences": {"Archaeology": 0},
                             {"Arts and Cultural Studies": 20}
                             ...
            ,
		    "color": "c54c82",
            "categoroy": "Disciplines"
		     },
	"Arts":
			{"coocurrences": {"Archaeology": 20},
				             {"Arts and Cultural Studies": 0}
			,
		    "color": "c54c82",
            "categoroy": "Disciplines"
		    }
}

@author: lukas & martina
########################################################################
"""
# Import of needed libraries
import urllib.request
import json
from datetime import datetime

# The variable in which the data from the API is initially saved
data_tot = []

# Request the data via the Course Registry API; only recent ones
with urllib.request.urlopen("https://dhcr.clarin-dariah.eu/api/v1/courses/index?recent") as url:
        data = json.loads(url.read().decode())
        # Check if the start_date input is formatted correctly
        for j in data:
            # If no start_date is specified, the respective entry will be omitted
            if j['start_date']=='' or j['start_date']==None:
                continue
            else:
                # Variable for the new (corrected) start_date
                new_date_str = ''
                # In case several start_dates are given process each one
                for dd in j['start_date'].split(';'):
                    try:
                        new_date = datetime.strptime(dd, '%Y-%m-%d')
                        new_date_str += dd
                    except ValueError:
                        new_date = datetime.strptime(dd, '%Y-%m')
                        new_date = new_date.strftime('%Y-%m-%d')
                        new_date_str += new_date
                # If several dates were given, the ';' has to be placed again for correct formatting
                if len(new_date_str) > 10:
                    for i in range(int(len(new_date_str)/10)-1,0,-1):
                        new_date_str = new_date_str[:i*10]+';'+ new_date_str[i*10:]
                # Update the start_date for each entry
                j['start_date'] = new_date_str
                # Append the entry to the data variable
                data_tot.append(j)

# A list to store lists with all keywords from each item of the course list
keyWordList = []

# Lists for unique disciplines, objects, techniques, and a list for all together
disList = []
objList = []
teqList = []
totList = []

# Add all keywords to their respective lists
for i in data_tot:
    keyWordList.append([])
    for j in i['disciplines']:
        keyWordList[-1].append(j['name'])
        if j['name'] not in disList:
            disList.append(j['name'])
    for j in i['tadirah_objects']:
        keyWordList[-1].append(j['name'])
        if j['name'] not in objList:
            objList.append(j['name'])
    for j in i['tadirah_techniques']:
        keyWordList[-1].append(j['name'])
        if j['name'] not in teqList:
            teqList.append(j['name'])

# Sort the list alphabetically; also with respect to capital letters
disList = sorted(disList, key=lambda L: (L.lower(), L))
objList = sorted(objList, key=lambda L: (L.lower(), L))
teqList = sorted(teqList, key=lambda L: (L.lower(), L))

# Add individual lists to the list with all keywords
totList = disList + objList + teqList

# We create a dictionary -> {}
# For each keyword a dictionary that will contain values for co-occurences,
# edge color, and the keyword's category is added.
# --> {'Archaeology':{'coocurrences': {}, 'color': '', 'category': ''}}
# For the co-occurence count a dictionary with each keyword is added
# Initially the values are all set to 0
# --> {'Archaeology':{'coocurrences': {'Archaeology': 0, ...}, 'color': '#c54c82',
#                     'category': 'Disciplines'}}
totDict = {}
for i in totList:
    totDict[i] = {'coocurrences': {}, 'color': '', 'category': ''}
    if i in disList:
        totDict[i]['color'] = '#c54c82'
        totDict[i]['category'] = 'Disciplines'
    elif i in objList:
        totDict[i]['color'] = '#003365'
        totDict[i]['category'] = 'Objects'
    elif i in teqList:
        totDict[i]['color'] = '#609f60'
        totDict[i]['category'] = 'Techniques'
    else:
        totDict[i]['color'] = '#9a9a9a'
    for j in totList:
        totDict[i]['coocurrences'][j] = 0

# Now each list in keywordlist will be checked and the count of the respective
# co-occurence pair in totDict is increased
for i in keyWordList:
    for j in i:
        for k in i:
            # Only increase if keyword is not co-occuring with itself
            if k!=j:
                totDict[j]['coocurrences'][k] +=1

#### now the matrix will be defined as follows:
#
#       [  [0, 0, ...., 0, 0],   //row for disList[0]
#          [0, 0, ...., 0, 0],   //row for disList[1]
#          .
#          .
#          [0, 0, ...., 0, 0],   //row for teqList[-2]
#          [0, 0, ...., 0, 0]  ] //row for teqList[-1]
#
####

totMat = []

for i in totList:
    totMat.append([])
    for j in totList:
        totMat[-1].append(totDict[i]['coocurrences'][j])


# For the d3 code the color variable can also be generated here
colors = []
for i in disList:
    colors.append('#c54c82')
for i in objList:
    colors.append('#003365')
for i in teqList:
    colors.append('#609f60')

stop = len(colors)


# Finally the js-file is written
with open('dataMat.js', 'w') as outfile:
    outfile.write('var dataMat = [ \n')
    for i in range(len(totMat)):
        outfile.write(str(totMat[i][0:stop+1]) + ', //'+ totList[i] +' \n')
        if i == stop:
            break
    outfile.write(']; \n')

    outfile.write('var totColors =')
    outfile.write(str(colors) )
    outfile.write('; \n')

    outfile.write('var totList =')
    outfile.write(str(totList) )
    outfile.write('; \n')

    outfile.write("var totDict = '")
    json.dump(totDict, outfile)
    outfile.write("'")
