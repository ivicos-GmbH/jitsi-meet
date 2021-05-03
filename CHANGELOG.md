# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.17] - 2021-05-03
### Added
- Adjust close/open timing for Noise Gate.

## [1.1.16] - 2021-05-03
### Added
- Enable createNoisegateProcessor to test if it works after modifying campus-alpha-client config to enable audioLevels and set intervals.

## [1.1.15] - 2021-04-30
### Added
- Update to @ivicos/lib-jitsi-meet version 1.0.1.

## [1.1.14] - 2021-04-28
### Added
- Skip createNoiseGateProcessor and console.log 'audioLevel' and 'volume', to double check if even skipping the noise gate the audioLevel is 0.

## [1.1.13] - 2021-04-26
### Added
- Enable console.log for volume, oldVolume and newVolume values.
## [1.1.12] - 2021-04-26
### Added
- NoiseGate Effect created using the Thumbnails volume and the current audioLevel of each remote participant.

## [1.1.11] - 2021-04-15
### Added
- External API commands to access speaker stats
- Possibility to request either once or at multiple intervals the speaker stats

## [1.1.10] - 2021-04-15
### Fixed
- Restoring linux compatibility for build commands

## [1.1.9] - 2021-04-13
### Added
- Option enabling for the user to retry when the access to the camera failed

### Fixed
- Camera error notification also displayed in case of 1+ access to the camera

## [1.1.8] - 2021-04-09
### Added
- Documentation for contributions and deployment process

## [1.1.7] - 2021-04-08
### Added
- Add UI for the foreground overlay functionality

## [1.1.6] - 2021-04-08
### Changed
- Deleting specific release branch to only rely on master to create release.

## [1.1.5] - 2021-04-07
### Added
- Notify the client when a new foreground overlay is being set

## [1.1.4] - 2021-03-30
### Added
- Removing versioning for bundle files in import

## [1.1.3] - 2021-03-29
### Added
- Added external dependencies compiled file (external_api.js)

## [1.1.2] - 2021-03-24
### Fixed
- Synchronization issue for the 'set room background' command

### Added
- UI for the set room background feature

## [1.1.1] - 2021-03-23
### Fixed
- Fixing video order in tile view after rebasing

## [1.1.0] - 2021-03-23
### Added
- Updating the community version of Jitsi Meet (Rebasing with master)
- Breaking change for video order predictability

## [1.0.6] - 2021-03-23
### Changed
- Order of the video tracks is now deterministic and each user sees the same order of the video tracks

## [1.0.5] - 2021-03-23
### Added
- Adding the possibility to set a foreground overlay for each participant

## [1.0.4] - 2021-03-19
### Added
- Adding an external endpoint to add a background image/color to the room

## [1.0.3] - 2021-03-19
### Fixed
- Correction about which files should be packaged in the release.

## [1.0.2] - 2021-03-19
### Fixed
- ivicos-release does not trigger CI pipeline for PRs

## [1.0.1] - 2021-03-19
### Changed
- Debian Changelog not regenerated for every version but just keeping the last version
- Merge to master does not trigger a release/packaging anymore

### Added
- Merge to 'ivicos-release' triggers release/packaging

## [1.0.0] - 2021-03-18
### Added
- Adding CHANGELOG
- Adding Github actions for checks when new push on a branch and release management when merging with master