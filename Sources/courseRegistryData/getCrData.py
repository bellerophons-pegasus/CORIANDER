#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
########################################################################
Created on Wed Mar 25 12:36:44 2020

A script to load the DH Course Registry data into a .js file.
It also checks if the start dates are in the correct format: (%Y-%m-%d).
If the desired date format is not used it will be corrected accordingly.
A course without any date information is not included into the dataset.
The whole dataset is saved into the variable 'data' in the file index.js.

@author: lukas
########################################################################
"""
# Import of needed libraries
import urllib.request
import json
from datetime import datetime

# The variable in which the data from the API is initially saved
data_tot = []

# Request the data via the Course Registry API
with urllib.request.urlopen("https://dhcr.clarin-dariah.eu/api/v1/courses/index") as url:
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
                        new_date_str = new_date_str[:i*10] +  ';'+ new_date_str[i*10:]
                # Update the start_date for each entry
                j['start_date'] = new_date_str
                # Append the entry to the data variable
                data_tot.append(j)

# Finally the js-file is written
with open('index.js', 'w') as outfile:
    outfile.write('var data = ')
    json.dump(data_tot, outfile)
