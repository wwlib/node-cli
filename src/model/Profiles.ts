import Profile from './Profile';

export default class Profiles {

    static DEFAULT_ID = 'Default';

    public profileMap: any = {};
    public activeProfileID: string

    constructor(data: any) {
        this.activeProfileID = data.activeProfileId;
        data.profiles.forEach((profileData: any) => {
            this.profileMap[profileData.profileId] = new Profile(profileData);
        });
    }

    getProfileWithId(id: string): Profile | undefined {
        return this.profileMap[id];
    }

    getActiveProfile(): Profile {
        return this.profileMap[this.activeProfileID];
    }

    getDefaultProfile(): Profile {
        this.activeProfileID = Profiles.DEFAULT_ID;
        return this.profileMap[Profiles.DEFAULT_ID];
    }

    getProfileIds(): string[] {
        const profileKeys: string[] = Object.keys(this.profileMap).sort();
        return profileKeys;
    }

    setActiveProfile(id: string): Profile {
        if (this.profileMap[id]) {
            this.activeProfileID = id;
        }
        return this.getActiveProfile();
    }

    setProfileProperty(key: string, value: string) {
        let profile: Profile = this.getActiveProfile();
        if (profile) {
            if (key === Profile.ID_KEY && !this.profileMap[value]) {
                let oldId: string = profile.id;
                let newId: string = value;
                delete(this.profileMap[oldId]);
                profile.setProperty(key, newId);
                this.profileMap[newId] = profile;
                this.activeProfileID = newId;
            } else {
                profile.setProperty(key, value);
            }
        }
    }

    addProfile(data: any): Profile {
        let result: Profile = this.getActiveProfile();
        let profile: Profile = new Profile(data);
        if (profile.id) {
            this.profileMap[profile.id] = profile;
            result = this.setActiveProfile(profile.id)
        }
        return result;
    }

    newProfile(profileId: string, makeActiveProfile: boolean = true): Profile | undefined {
        let result: Profile | undefined = undefined;
        let profile: Profile = new Profile();
        if (profileId && !this.profileMap[profileId]) {
            profile.id = profileId
            this.profileMap[profile.id] = profile;
            result = profile;
            if (makeActiveProfile) {
              this.setActiveProfile(profile.id);
            }
        }
        return result;
    }

    deleteProfile(id: string): Profile {
        let result: Profile = this.getActiveProfile();
        if (id == Profiles.DEFAULT_ID || !this.getProfileWithId(id)) {
            // noop
        } else {
            delete this.profileMap[id]
            if (id === this.activeProfileID) {
                this.activeProfileID = '';
                const profileKeys: string[] = Object.keys(this.profileMap).sort();
                profileKeys.forEach(key => {
                    if (this.profileMap[key] && !this.activeProfileID) {
                        this.activeProfileID = key;
                        result = this.setActiveProfile(this.activeProfileID);
                    }
                });
                if (!result) {
                    result = this.getDefaultProfile();
                }
            }
        }
        return result;
    }

    get json(): any {
        let result: any = {}
        result.activeProfileId = this.activeProfileID;
        result.profiles = [];
        const profileKeys: string[] = Object.keys(this.profileMap).sort();
        profileKeys.forEach(key => {
            result.profiles.push(this.profileMap[key].json);
        });
        return result;
    }

}