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
#   This script loads the Course Registry data in a .js file. Additionally it checks if the start dates are in the correct format
#   if not the desired format (%Y-%m-%d) is used, it will be corrected and the whole dataset is saved in the file index.js
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


#### requesting the data via the Course Registry API

with urllib.request.urlopen("https://dhcr.clarin-dariah.eu/api/v1/courses/index") as url:
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
            
#### finally the new file is written
         
with open('index.js', 'w') as outfile:
    outfile.write('var data = ')
    json.dump(data_tot, outfile)

            