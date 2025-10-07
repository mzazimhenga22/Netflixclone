
import { Embed, Sourcerer } from './base';
import { doodScraper } from './embeds/dood';
import { mixdropScraper } from './embeds/mixdrop';
import { turbovidScraper } from './embeds/turbovid';
import { upcloudScraper } from './embeds/upcloud';
import { autoembedScraper } from './sources/autoembed';
import { ee3Scraper } from './sources/ee3';
import { fsharetvScraper } from './sources/fsharetv';
import { insertunitScraper } from './sources/insertunit';
import { mp4hydraScraper } from './sources/mp4hydra';
import { nepuScraper } from './sources/nepu';
import { pirxcyScraper } from './sources/pirxcy';
import { tugaflixScraper } from './sources/tugaflix';
import { vidsrcScraper } from './sources/vidsrc';
import { vidsrcvipScraper } from './sources/vidsrcvip';
import { zoechipScraper } from './sources/zoechip';

import { AnimetsuEmbeds } from './embeds/animetsu';
import {
  autoembedBengaliScraper,
  autoembedEnglishScraper,
  autoembedHindiScraper,
  autoembedTamilScraper,
  autoembedTeluguScraper,
} from './embeds/autoembed';
import { cinemaosEmbeds, cinemaosHexaEmbeds } from './embeds/cinemaos';
import { closeLoadScraper } from './embeds/closeload';
import { madplayBaseEmbed, madplayNsapiEmbed, madplayNsapiVidFastEmbed, madplayRoperEmbed } from './embeds/madplay';
import { mp4hydraServer1Scraper, mp4hydraServer2Scraper } from './embeds/mp4hydra';
import { myanimedubScraper } from './embeds/myanimedub';
import { myanimesubScraper } from './embeds/myanimesub';
import { ridooScraper } from './embeds/ridoo';
import { streamtapeLatinoScraper, streamtapeScraper } from './embeds/streamtape';
import { streamvidScraper } from './embeds/streamvid';
import {
  streamwishEnglishScraper,
  streamwishJapaneseScraper,
  streamwishLatinoScraper,
  streamwishSpanishScraper,
} from './embeds/streamwish';
import { vidCloudScraper } from './embeds/vidcloud';
import { vidifyEmbeds } from './embeds/vidify';
import {
  vidnestAllmoviesEmbed,
  vidnestFlixhqEmbed,
  vidnestHollymoviehdEmbed,
  vidnestOfficialEmbed,
} from './embeds/vidnest';
import {
  VidsrcsuServer10Scraper,
  VidsrcsuServer11Scraper,
  VidsrcsuServer12Scraper,
  VidsrcsuServer1Scraper,
  VidsrcsuServer20Scraper,
  VidsrcsuServer2Scraper,
  VidsrcsuServer3Scraper,
  VidsrcsuServer4Scraper,
  VidsrcsuServer5Scraper,
  VidsrcsuServer6Scraper,
  VidsrcsuServer7Scraper,
  VidsrcsuServer8Scraper,
  VidsrcsuServer9Scraper,
} from './embeds/vidsrcsu';
import { viperScraper } from './embeds/viper';
import { warezcdnembedHlsScraper } from './embeds/warezcdn/hls';
import { warezcdnembedMp4Scraper } from './embeds/warezcdn/mp4';
import { warezPlayerScraper } from './embeds/warezcdn/warezplayer';
import { zunimeEmbeds } from './embeds/zunime';
import { EightStreamScraper } from './sources/8stream';
import { animeflvScraper } from './sources/animeflv';
import { animetsuScraper } from './sources/animetsu';
import { cinemaosScraper } from './sources/cinemaos';
import { coitusScraper } from './sources/coitus';
import { cuevana3Scraper } from './sources/cuevana3';
import { embedsuScraper } from './sources/embedsu';
import { hdRezkaScraper } from './sources/hdrezka';
import { iosmirrorScraper } from './sources/iosmirror';
import { iosmirrorPVScraper } from './sources/iosmirrorpv';
import { lookmovieScraper } from './sources/lookmovie';
import { madplayScraper } from './sources/madplay';
import { myanimeScraper } from './sources/myanime';
import { nunflixScraper } from './sources/nunflix';
import { rgshowsScraper } from './sources/rgshows';
import { ridooMoviesScraper } from './sources/ridomovies';
import { slidemoviesScraper } from './sources/slidemovies';
import { soaperTvScraper } from './sources/soapertv';
import { streamboxScraper } from './sources/streambox';
import { vidapiClickScraper } from './sources/vidapiclick';
import { vidifyScraper } from './sources/vidify';
import vidnestScraper from './sources/vidnest';
import { warezcdnScraper } from './sources/warezcdn';
import { wecimaScraper } from './sources/wecima';
import { zunimeScraper } from './sources/zunime';

export function gatherAllSources(): Array<Sourcerer> {
  // all sources are gathered here
  return [
    cuevana3Scraper,
    ridooMoviesScraper,
    hdRezkaScraper,
    warezcdnScraper,
    insertunitScraper,
    soaperTvScraper,
    autoembedScraper,
    myanimeScraper,
    tugaflixScraper,
    ee3Scraper,
    fsharetvScraper,
    vidsrcScraper,
    zoechipScraper,
    mp4hydraScraper,
    embedsuScraper,
    slidemoviesScraper,
    iosmirrorScraper,
    iosmirrorPVScraper,
    vidapiClickScraper,
    coitusScraper,
    streamboxScraper,
    nunflixScraper,
    EightStreamScraper,
    wecimaScraper,
    animeflvScraper,
    cinemaosScraper,
    nepuScraper,
    pirxcyScraper,
    vidsrcvipScraper,
    madplayScraper,
    rgshowsScraper,
    vidifyScraper,
    zunimeScraper,
    vidnestScraper,
    animetsuScraper,
    lookmovieScraper,
  ];
}

export function gatherAllEmbeds(): Array<Embed> {
  // all embeds are gathered here
  return [
    upcloudScraper,
    vidCloudScraper,
    mixdropScraper,
    ridooScraper,
    closeLoadScraper,
    doodScraper,
    streamvidScraper,
    streamtapeScraper,
    warezcdnembedHlsScraper,
    warezcdnembedMp4Scraper,
    warezPlayerScraper,
    autoembedEnglishScraper,
    autoembedHindiScraper,
    autoembedBengaliScraper,
    autoembedTamilScraper,
    autoembedTeluguScraper,
    turbovidScraper,
    mp4hydraServer1Scraper,
    mp4hydraServer2Scraper,
    VidsrcsuServer1Scraper,
    VidsrcsuServer2Scraper,
    VidsrcsuServer3Scraper,
    VidsrcsuServer4Scraper,
    VidsrcsuServer5Scraper,
    VidsrcsuServer6Scraper,
    VidsrcsuServer7Scraper,
    VidsrcsuServer8Scraper,
    VidsrcsuServer9Scraper,
    VidsrcsuServer10Scraper,
    VidsrcsuServer11Scraper,
    VidsrcsuServer12Scraper,
    VidsrcsuServer20Scraper,
    viperScraper,
    streamwishJapaneseScraper,
    streamwishLatinoScraper,
    streamwishSpanishScraper,
    streamwishEnglishScraper,
    streamtapeLatinoScraper,
    ...cinemaosEmbeds,
    ...cinemaosHexaEmbeds,
    madplayBaseEmbed,
    madplayNsapiEmbed,
    madplayRoperEmbed,
    madplayNsapiVidFastEmbed,
    ...vidifyEmbeds,
    ...zunimeEmbeds,
    ...AnimetsuEmbeds,
    vidnestHollymoviehdEmbed,
    vidnestAllmoviesEmbed,
    vidnestFlixhqEmbed,
    vidnestOfficialEmbed,
    myanimesubScraper,
    myanimedubScraper,
  ];
}
