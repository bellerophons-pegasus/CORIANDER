#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Feb 29 08:48:46 2020

@author: lukas
"""



import urllib.request, json 



max_num = 3000



data_tot = []
#for i in range(0,max_num,100):
#    print(i)
#    with urllib.request.urlopen("https://api.zotero.org/groups/113737/items?start="+str(i)+"&limit=100") as url:
#        data = json.loads(url.read().decode())
#        
#        for j in data:
#            data_tot.append(j)
#
#
#
#
#print(len(data_tot))

with urllib.request.urlopen("https://api.zotero.org/groups/113737/items?tag=*****&limit=100") as url:
        data = json.loads(url.read().decode())
        
        for j in data:
            data_tot.append(j)

print(len(data_tot))

with open('zotero.js', 'w') as outfile:
    outfile.write('var dat_zot = ')
    json.dump(data_tot, outfile)


