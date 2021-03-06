/*
 *
 * Search Adapters
 *
 */

import {
  fiveStarRating,
  certificateAdapter,
  durationAdapter,
  synopsisAdapter,
} from '../adapters.common';
import * as map from '../datamap/index';

export const suggestionsAdapter = (resultObject, section, userId) => {
  const { results } = resultObject;
  return results.map(result => Object.assign(map.run(result, suggestionAdapter), {
    userId,
    section,
  }));
};

export const suggestionAdapter = map.create({
  // The universal unique ID of the entity suggested.
  // This will have a Search prefix ('srch:') if the content has not been
  // matched by the Programme Database and the UUID has been generated by Search.
  // Search generated UUIDs allow unmatched entities to be suggested and the
  // associated metadata recovered using the Entity API.
  uuid: map.to('uuid'),
  // The type of the entity associated with the uuid
  // "series", "programme", "sport", "team", "competition", "person" or "boxset"
  uuidtype: map.to('uuidtype'),
  // The title of the entity
  t: map.to('title'),
  // The programme or boxset type ("programme", "movie", "movie boxset")
  type: map.to('type').optional,
  // Synopsis of the entity (if available).
  sy: map.to('synopsis').with(synopsisAdapter).optional,
});

export const seriesAdapter = map.create({
  seriesuuid: map.to('seriesId'),
  seriestitle: map.to('seriesTitle'),
});

export const seasonAdapter = map.create({
  seasonuuid: map.to('seasonId'),
  seasontitle: map.to('seasonTitle'),
  seasonnumber: map.to('seasonNumber'),
  episodenumber: map.to('episodeNumber'),
});

export const programmeAdapter = map.create({
  uuid: map.to('uuid'),
  uuidtype: map.to('uuidtype'),
  t: map.to('t'),
  type: map.to('type'),
  episodenumber: map.to('episodeNumber'),
  waystowatch: map.to('watch').with(w => waysToWatchAdapter(w)),
  sy: map.to('synopsis'),
  reviewrating: map.to('rating').with(fiveStarRating).optional,
  r: map.to('certificate').with(certificateAdapter),
  trailer: map.to('hasTrailer').bool,
});

export const linearAdapter = map.create({
  st: map.to('startsAt').epoch,
  end: map.to('endsAt').epoch,
  channelname: map.to('channelName'),
  sid: map.to('serviceId'),
  eventid: map.to('eventId'),
  d: map.to('duration').with(durationAdapter),
  videotype: map.to('quality'),
  is3D: map.to('is3D').bool,
  s: map.to('hasSubtitles').bool,
  ad: map.to('hasAudioDescription').bool,
  at: map.to('audioType').bool,
  hardofhearing: map.to('isSuitableForHardOfHearing').bool,
  ippv: map.to('isIPPV').bool,
  sy: map.to('synopsis').with(synopsisAdapter),
  marketingmessage: map.to('marketingMessage').optional,
  cgid: map.to('channelGroupId'),
  cgname: map.to('channelGroupName'),
  canl: map.to('canSeriesLink').bool,
  c: map.to('channelNumber'), // Logical Channel Number...
});

export const svodAdapter = map.create({
  added: map.to('dateAdded').epoch,
  availendtime: map.to('dateExpires').epoch,
  providerid: map.to('providerId'),
  providername: map.to('providerName'),
  programmeid: map.to('programmeId'),
  pushedprogrammeid: map.to('pushedProgrammeId'),
  downloadlink: map.to('downloadLink'),
  d: map.to('duration').with(durationAdapter),
  size: map.to('downloadSizeBytes').number,
  sid: map.to('serviceId'),
  channelname: map.to('channelName'),
  broadcastime: map.to('broadCastTime'),
  videotype: map.to('quality'),
  hardofhearing: map.to('isSuitableForHardOfHearing').bool,
  ippv: map.to('isIPPV').bool,
  sy: map.to('synopsis').with(synopsisAdapter),
  r: map.to('certificate').with(certificateAdapter),
  marketingmessage: map.to('marketingMessage').optional,
  cgid: map.to('channelGroupId'),
  cgname: map.to('channelGroupName'),
});

export const compoundResultAdapter = (item) => {
  let result = map.run(item, programmeAdapter);
  if (item.seriesuuid) {
    result = Object.assign(result, map.run(item, seriesAdapter));
  }
  if (item.seasonuuid) {
    result = Object.assign(result, map.run(item, seasonAdapter));
  }
  return result;
};

export const waysToWatchAdapter = (waystowatch) => {
  const results = [];
  Object.keys(waystowatch).forEach(key => {
    switch (key) {
      case 'linear':
        results.push(waystowatch[key].map(data => map.run(linearAdapter, data)));
        break;
      case 'svod':
        results.push(waystowatch[key].map(data => map.run(svodAdapter, data)));
        break;
      case 'store':
      case 'est':
      case 'ott':
      default:
        break;
    }
  });
  return results;
};

export const resultsAdapter = (results) => {
  const { programmes } = results;
  if (!programmes) {
    return [];
  }
  return programmes.map(compoundResultAdapter);
};
