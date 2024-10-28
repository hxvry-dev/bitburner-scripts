# TODO.md

Things to work on for the `bitburner-scripts` repo.

## Todo

### Batcher

- [ ] Optimize/simplify the `batching` algorithm more.
- [ ] Re-write `loop.ts` so that it works for early-game play.

### Maybe BatchManager.ts?

- [ ] Allow `Batcher`/`Manager` to upgrade/purchase new p-servers.
- [ ] Allow `Batcher`/`Manager` to purchase Hack Programs (Ex. BruteSSH.exe)
  - [ ] Have the `Batcher`/`Manager` script purchase `Formulas.exe` automatically.

## In Progress

## Done ✓

- [x] Release Batcher v1
- [x] Refactored `baseServer.ts` and removed the extraneous sub-files
  - [x] Finish `baseServer_v2`
  - [x] Finish `pServers`
  - [x] Finish `server_v4`
  - [x] Finish `serverManager`
- [x] Implement method for `Batcher` to auto-root servers, so it can be a set-and-forget.
  - [x] Optimize/simplify the `batching` algorithm.
