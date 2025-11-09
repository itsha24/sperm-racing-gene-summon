// Import sound files from src/sounds directory
import commonFart from "./sounds/common_fart.mp3";
import commonPipe from "./sounds/common_pipe.mp3";
import rareFah from "./sounds/rare_fah.mp3";
import rareFart from "./sounds/rare_fart.mp3";
import epicGalaxy from "./sounds/epic_galaxy.mp3";
import epicRizz from "./sounds/epic_rizz.mp3";
import mythicAnimeWow from "./sounds/mythic_anime_wow.mp3";
import mythicRomance from "./sounds/mythic_romance.mp3";
import regular from "./sounds/regular.mp3";

export const raritySoundMap = {
  Common: [commonFart, commonPipe],
  Rare: [rareFah, rareFart],
  Epic: [epicGalaxy, epicRizz],
  Mythic: [mythicAnimeWow, mythicRomance]
};

export const regularSound = regular;  