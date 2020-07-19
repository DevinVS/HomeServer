# Vander Stelt File Server

This is the documentation for all the services and scripts that run on the server to make it work seamlessly.

## Source Code

This is the directory in which all relevant projects to the server are stored.

| Name | Description | Extra Details |
| --- | --- | --- |
| wsdd | Allows windows clients to detect the samba share | Called by wsdd.service |
| backend | A websockets powered backend that monitors services and server resources | The services to monitor are defined in a list at the top of index.js, additionally `ifstat` must be available on the system |
| frontend | A react powered frontend that utilizes the websockets backend to present the web dashboard |

## Services

| Name         | Description | Extra Details |
| ------------ | ----------- | ------------- |
| smbd.service | Makes the server accessible through "shares" to Windows, MacOS, and Linux clients via the Samba file sharing protocol | config file found at /etc/samba/smb.conf | 
| wsdd.service | Since Windows is rolling out a new Windows Discovery method, this python script is required to be running for the server to be discoverable by Windows clients | |
| backup.service | Syncs the contents of /share to s3 | AWS credentials must be present in ~/.aws/credentials |
| backup.timer | Starts backup.service every night at midnight | |
| backend.service | The websockets backend for the web dashboard | |
| nginx.service | Serves the frontend for the web dashboard | Site config found in /etc/nginx/sites-available |
| MinecraftServer.service | Runs the Minecraft Server | |

## Scripts

| Name        | Description |
| ----------- | ----------- |
| backup      | Syncs /share with s3, called by backup.service |
| m4aToMp3    | converts a single m4a file to mp3 format |
| wavToMp3    | converts a single wav file to mp3 format |
| wmaToMp3    | converts a single wma file to mp3 format |
| hide        | hides a single file by appending a "." to its basename |
| autoconvert | using the above scripts, find all m4a, wav, and wma files, convert them to mp3 format, rename them the .bak format and then hide them |
| filetypes   | Prints out all file extensions currently existing in the Music directory along with their count |
