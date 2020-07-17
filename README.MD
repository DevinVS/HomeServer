# Vander Stelt File Server

This is the documentation for all the services and scripts that run on the server to make it work seamlessly.

## Services

| Name         | Description | Extra Details |
| ------------ | ----------- | ------------- |
| smbd.service | Makes the server accessible through "shares" to Windows, MacOS, and Linux clients via the Samba file sharing protocol | All operations are currently completed by a user named "samba_user" with a blank password. This was done in order that windows clients won't fail to authenticate and basically functions as a dummy login | 
| wsdd.service | Since Windows is rolling out a new Windows Discovery method, this python script is required to be running for the server to be discoverable by Windows clients | |

## Scripts

| Name        | Description |
| ----------- | ----------- |
| m4aToMp3    | converts a single m4a file to mp3 format |
| wavToMp3    | converts a single wav file to mp3 format |
| wmaToMp3    | converts a single wma file to mp3 format |
| hide        | hides a single file by appending a "." to its basename |
| autoconvert | using the above scripts, find all m4a, wav, and wma files, convert them to mp3 format, rename them the .bak format and then hide them |
| filetypes   | Prints out all file extensions currently existing in the Music directory along with their count |
