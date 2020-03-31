#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Feb 29 08:48:46 2020

@author: lukas and martina
"""
####
# This script imports the literature from Zotero. All items with the tag "*****" are called (see readme).
# Afterwards the literature information is saved in JSON format for later use
####

# Use one module for the API request and one for the JSON formatting
import urllib.request, json 

# Variable for the literature data
data_tot = []

# Here the API is called and saved
with urllib.request.urlopen("https://api.zotero.org/groups/113737/items?tag=*****&limit=100") as url:
        data = json.loads(url.read().decode())
        for j in data:
            data_tot.append(j)

# Finally the data is saved as a javascript variable
with open('zotero.js', 'w') as outfile:
    outfile.write('var dat_zot = ')
    json.dump(data_tot, outfile)
