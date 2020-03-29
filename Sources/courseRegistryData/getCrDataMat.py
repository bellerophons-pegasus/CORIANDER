#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Mar 25 12:36:44 2020

@author: lukas
"""

####
####
####
#
#   This script generates a co-occurence matrix for the disciplines/objects/techniques from all recent courses
#
####
####
####


#### only some basic modules are used

import urllib.request
import json
from datetime import datetime


#### the variable in which the data is initially saved

data_tot = []


#### requesting the data via the Course Registry API; only recent ones

with urllib.request.urlopen("https://dhcr.clarin-dariah.eu/api/v1/courses/index?recent") as url:
        data = json.loads(url.read().decode())
        
        #### Checking if the start_date input is formatted correctly
        
        for j in data:
            
            #### if there is no start_date specified, the respective entry will be omitted
            
            if j['start_date']=='' or j['start_date']==None:
                continue
            
            else:
                
                #### string for the new (corrected) start_date
                
                new_date_str = ''
                
                #### in case several start_dates are given
                
                for dd in j['start_date'].split(';'):
                    try:
                        new_date = datetime.strptime(dd, '%Y-%m-%d')
                        new_date_str += dd
                    except ValueError:
                        new_date = datetime.strptime(dd, '%Y-%m')
                        new_date = new_date.strftime('%Y-%m-%d')
                        new_date_str += new_date
                        
                #### if several dates were given, the ';' has to be placed again for correct formatting
                
                if len(new_date_str) > 10:
                    for i in range(int(len(new_date_str)/10)-1,0,-1):
                        new_date_str = new_date_str[:i*10] +  ';'+ new_date_str[i*10:]
                        
                #### updating the start_date for each entry 
                
                j['start_date'] = new_date_str
          
                #### appending the entry to the data variable
                
                data_tot.append(j)
            
            
            
#### for simplicity, a list is created in which all the keywords from each item 
#### are stored
keyWordList = []          

#### lists for disciplines/objects/techniques and a total list for all keywords   
disList = []
objList = []
teqList = []
totList = []

#### add all keywords to the respective lists
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

#### sort the list alphabetically; also with respect to capital letters
disList = sorted(disList, key=lambda L: (L.lower(), L))
objList = sorted(objList, key=lambda L: (L.lower(), L))
teqList = sorted(teqList, key=lambda L: (L.lower(), L))

totList = disList + objList + teqList


#### define a dict 
#### for each keyword a new dict is added with all keywords 
#### initially they have the value 0
#### may also be written into a variable for later usage
totDict = {}

for i in totList:
    totDict[i] = {}
    for j in totList:
        totDict[i][j] = 0

#### now each item in keywordlist will be checked and the respective number 
#### are increased

for i in keyWordList:
    for j in i: 
        for k in i:  
            if k!=j:   
                totDict[j][k] +=1

#### now the matrix will be defined as follows:
#
#
#       [  [0, 0, ...., 0, 0],   //row for disList[0]
#          [0, 0, ...., 0, 0],   //row for disList[1]
#          .
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
        totMat[-1].append(totDict[i][j])


#### for the d3 code the color variable can also be generated here

colors = []
for i in disList:
    colors.append('#FFFF00ff')
for i in objList:
    colors.append('#0000FFff')
for i in teqList:
    colors.append('#008000ff')            


stop = len(colors)      


#### finally the new file is written
         
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
    
    outfile.write('var coocDict = ')
    json.dump(totDict, outfile)
    outfile.write('; \n')

