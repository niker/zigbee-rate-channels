# Zigbee Rate Channels

Tool for managing congestion and interference on a zigbee network running ZHA integration in Home Assistant.

## rate-channels.js
﻿This script reads many ZHA diagnostic JSON files and calculates the average congestion values for each channel within a specified time window.
The averages are weighted per hour of the day, so that taking too many samples in a short period of time will not skew the results.

### Prerequisites
- Latest Node.js must be installed, older versions will probably work as well.

### Gathering input data
- Go to your home assistant instance "Zigbee Home Automation" integration
- Open the habmurger menu on your coordinator dongle (3 dots)
- Select "Download diagnostic data"
- A JSON file will download, this contains the current zigbee and wi-fi congestion information
- Troughout the day click this download button, you will need enough data about wireless usage of you and your neighbors
- You want to generate a diagnostic file at **least** once per hour
- Do not modify these files, the modification date will be used to determine when the measurement was taken.

### Rating channels
- Clone the repo or just download the raw js file
- You can edit rate-channels.js and specify the time window to be analyzed, default is last 24 hours.
- You can also change the input directory where to get JSON files
- Copy all the JSON diagnostic files you downloaded to the **input** directory
- Open terminal in the directory and run

> node rate-channels.js

You will get output like this with best channel at the top:

```json
[{"channel":"24","usage":"2.97"},
{"channel":"25","usage":"4.65"},
{"channel":"22","usage":"8.43"},
{"channel":"23","usage":"9.77"},
{"channel":"11","usage":"16.16"},
{"channel":"21","usage":"17.65"},
{"channel":"12","usage":"22.14"},
{"channel":"18","usage":"38.12"},
{"channel":"19","usage":"40.19"},
{"channel":"17","usage":"42.96"},
{"channel":"20","usage":"45.52"},
{"channel":"16","usage":"92.75"},
{"channel":"13","usage":"93.19"},
{"channel":"26","usage":"94.67"},
{"channel":"14","usage":"96.36"},
{"channel":"15","usage":"96.53"}]
```

### Migrating your ZHA to another channel
- Be aware that not all devices will migrate automatically, sensors that are battery powered may be a problem.
- Anything powered by mains or USB power should migrate automatically. After changing the channel, wait for an hour, that is enough time for most devices to migrate.
- Wirelessly prod all powered devices, start with the ones closest to your coordinator dongle. Try to send commands to them until they stabilize then wait a few minutes and move to devices farther away.
- You may need to re-add devices to lightlink groups. If a powered device doesn't work, re-pair it.
- To re-pair, just poke those reset buttons for 5 seconds and add new device in ZHA, they should retain their HA configuration. Be patient and do not add more than 2 devices at a time.
- Don't forget to turn ON your repeaters, some USB ones default to OFF.
- Once you re-establish your powered mesh, go through your battery powered devices one by one. 
- If one sensor of a certain brand doesn't reconnect in a few minutes after triggering it, they will probably all fail and it's faster to re-pair them all. 
- If the devices fail to re-pair, physically move them right next to the coordinator antenna to re-pair and then move them back.
- Your entire network will be constantly changing topology for at least 24 hours until it settles, expect sensors to go N/A in this time.
- Sensors may also just get stuck, when triggered they may not appear to do anything but would reconnect after about 15s.
- Do not trust your security sensors for at least a day, do frequent rounds and try to trigger them.
- After a day or so the network should be stable, the frequency of sensors getting stuck will decrease and eventually stop.

### Remarks
- Be aware that you and your neighbors wi-fi access points may be set to select a channel automatically.
- If there is a power outage in your neighborhood, the channels may shift unexpectedly and so does congestion.
- If you are in a less congested area and know your neighbors, I suggest negotiating a fixed channel with them to prevent random shifts.
