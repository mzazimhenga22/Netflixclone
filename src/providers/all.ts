
import { Embed, Sourcerer } from './providers/base';
import { doodScraper } from './providers/embeds/dood';
import { mixdropScraper } from './providers/embeds/mixdrop';
import { turbovidScraper } from './providers/embeds/turbovid';
import { upcloudScraper } from './providers/embeds/upcloud';
import { autoembedScraper } from './providers/sources/autoembed';
import { ee3Scraper } from './providers/sources/ee3';
import { fsharetvScraper } from './providers/sources/fsharetv';
import { insertunitScraper } from './providers/sources/insertunit';
import { mp4hydraScraper } from './providers/sources/mp4hydra';
import { nepuScraper } from './providers/sources/nepu';
import { pirxcyScraper } from './providers/sources/pirxcy';
import { tugaflixScraper } from './providers/sources/tugaflix';
import { vidsrcScraper } from './providers/sources/vidsrc';
import { vidsrcvipScraper } from './providers/sources/vidsrcvip';
import { zoechipScraper } from './providers/sources/zoechip';

import { AnimetsuEmbeds } from './providers/embeds/animetsu';
import {
  autoembedBengaliScraper,
  autoembedEnglishScraper,
  autoembedHindiScraper,
  autoembedTamilScraper,
  autoembedTeluguScraper,
} from './providers/embeds/autoembed';
import { cinemaosEmbeds, cinemaosHexaEmbeds } from './providers/embeds/cinemaos';
import { closeLoadScraper } from './providers/embeds/closeload';
import { madplayBaseEmbed, madplayNsapiEmbed, madplayNsapiVidFastEmbed, madplayRoperEmbed } from './providers/embeds/madplay';
import { mp4hydraServer1Scraper, mp4hydraServer2Scraper } from './providers/embeds/mp4hydra';
import { myanimedubScraper } from './providers/embeds/myanimedub';
import { myanimesubScraper } from './providers/embeds/myanimesub';
import { ridooScraper } from './providers/embeds/ridoo';
import { streamtapeLatinoScraper, streamtapeScraper } from './providers/embeds/streamtape';
import { streamvidScraper } from './providers/embeds/streamvid';
import {
  streamwishEnglishScraper,
  streamwishJapaneseScraper,
  streamwishLatinoScraper,
  streamwishSpanishScraper,
} from './providers/embeds/streamwish';
import { vidCloudScraper } from './providers/embeds/vidcloud';
import { vidifyEmbeds } from './providers/embeds/vidify';
import {
  vidnestAllmoviesEmbed,
  vidnestFlixhqEmbed,
  vidnestHollymoviehdEmbed,
  vidnestOfficialEmbed,
} from './providers/embeds/vidnest';
import {
  VidsrcsuServer1Scraper,
  VidsrcsuServer10Scraper,
  VidsrcsuServer11Scraper,
  VidsrcsuServer12Scraper,
  VidsrcsuServer2Scraper,
  VidsrcsuServer20Scraper,
  VidsrcsuServer3Scraper,
  VidsrcsuServer4Scraper,
  VidsrcsuServer5Scraper,
  VidsrcsuServer6Scraper,
  VidsrcsuServer7Scraper,
  VidsrcsuServer8Scraper,
  VidsrcsuServer9Scraper,
} from './providers/embeds/vidsrcsu';
import { viperScraper } from './providers/embeds/viper';
import { warezcdnembedHlsScraper } from './providers/embeds/warezcdn/hls';
import { warezcdnembedMp4Scraper } from './providers/embeds/warezcdn/mp4';
import { warezPlayerScraper } from './providers/embeds/warezcdn/warezplayer';
import { zunimeEmbeds } from './providers/embeds/zunime';
import { EightStreamScraper } from './providers/sources/8stream';
import { animeflvScraper } from './providers/sources/animeflv';
import { animetsuScraper } from './providers/sources/animetsu';
import { cinemaosScraper } from './providers/sources/cinemaos';
import { coitusScraper } from './providers/sources/coitus';
import { cuevana3Scraper } from './providers/sources/cuevana3';
import { embedsuScraper } from './providers/sources/embedsu';
import { hdRezkaScraper } from './providers/sources/hdrezka';
import { iosmirrorScraper } from './providers/sources/iosmirror';
import { iosmirrorPVScraper } from './providers/sources/iosmirrorpv';
import { lookmovieScraper } from './providers/sources/lookmovie';
import { madplayScraper } from './providers/sources/madplay';
import { myanimeScraper } from './providers/sources/myanime';
import { nunflixScraper } from './providers/sources/nunflix';
import { rgshowsScraper } from './providers/sources/rgshows';
import { ridooMoviesScraper } from './providers/sources/ridomovies';
import { slidemoviesScraper } from './providers/sources/slidemovies';
import { soaperTvScraper } from './providers/sources/soapertv';
import { streamboxScraper } from './providers/sources/streambox';
import { vidapiClickScraper } from './providers/sources/vidapiclick';
import { vidifyScraper } from './providers/sources/vidify';
import vidnestScraper from './providers/sources/vidnest';
import { warezcdnScraper } from './providers/sources/warezcdn';
import { wecimaScraper } from './providers/sources/wecima';
import { zunimeScraper } from './providers/sources/zunime';

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
    // vidsrcNovaEmbed,
    // vidsrcCometEmbed,
    // vidsrcPulsarEmbed,
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
