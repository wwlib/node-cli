### node-cli

A node cli example with REPL mode for interactive prompts.

#### installation and building

```
npm install
npm run build
```

#### running

`npm run start`

#### installing globally (for development)
```
npm install -g git+ssh://git@github.com:wwlib/node-cli.git

node-cli
help

or

node-cli --command help

```

#### repl commands

`node-cli --command help`

```
$ <shell command>:        executes the specified shell command
load profile <path>:      loads the specified profile json
show profile <profileId>: shows the specified profile
delete profile <id>:      deletes the specified profile json (must save)
edit profile:             edit a profile property (must save)
new profile:              create a new profile (must save)
save profiles:            saves the loaded profiles
profiles:                 lists the loaded profiles
set profile <id>:         sets the active profile
config:                   shows current cli configuration
clear:                    clears the console
quit:                     quit
q:                        quit
bye:                      quit
x:                        quit
help:                     help
```


#### profile management
Creating a new Profile:
- use the `new profile` command
```
? [DEFAULT] new profile
? What is the user id?:
 USER_ID
? What is user password?:
 PASSWORD
? Provide a name (id) for the new profile:
 NEW
? Confirm: Create this new profile?:
 yes
profileId:    NEW
userId:       USER_ID
userPassword: PASSWORD
? [NEW] 
```

Loading a Profile:
- create a `my-profile.json` file based on the template below
- enter values for:
  - profileId (must be  unique)
  - userId
  - userPassword


Profile template: i.e. `my-profile.json`
```
{
    "profileId": "My Profile",
    "userId": "ID",
    "userPassword": "PASSWORD",
}
```