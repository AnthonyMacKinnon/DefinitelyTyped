import Client, { MapiClientConfig } from '@mapbox/mapbox-sdk';
import Datasets from '@mapbox/mapbox-sdk/services/datasets';
import Directions from '@mapbox/mapbox-sdk/services/directions';
import Geocoding from '@mapbox/mapbox-sdk/services/geocoding';
import Isochrone from '@mapbox/mapbox-sdk/services/isochrone';
import MapMatching from '@mapbox/mapbox-sdk/services/map-matching';
import Styles, { StylesService } from '@mapbox/mapbox-sdk/services/styles';
import StaticMap, { StaticMapService } from '@mapbox/mapbox-sdk/services/static';
import { LineString } from 'geojson';
import Tilesets, { TilesetsService } from '@mapbox/mapbox-sdk/services/tilesets';

/**
 * MapiClient
 */

const config: MapiClientConfig = {
    accessToken: 'access-token',
};

// $ExpectType MapiClient
const client = Client(config);

/**
 * Datasets
 */

// $ExpectType DatasetsService
const datasetsService = Datasets(client);

datasetsService
    .listDatasets()
    .send()
    .then(response => {
        // $ExpectType Dataset[]
        const datasets = response.body;
    });

datasetsService
    .listDatasets()
    .eachPage((error, response, next) => {
        // Handle error or response and call next.
        if (error) {
            // Handle error.
        } else if (response) {
            // Handle response.
            next();
        }
    });

datasetsService
    .createDataset({
        name: 'example',
        description: 'An example dataset'
    })
    .send()
    .then(response => {
        // $ExpectType Dataset
        const dataset = response.body;
    });

datasetsService
    .getMetadata({
        datasetId: 'dataset-id'
    })
    .send()
    .then(response => {
        // $ExpectType Dataset
        const dataset = response.body;
    });

datasetsService
    .updateMetadata({
        datasetId: 'dataset-id',
        name: 'foo'
    })
    .send()
    .then(response => {
        // $ExpectType Dataset
        const dataset = response.body;
    });

datasetsService
    .deleteDataset({
        datasetId: 'dataset-id'
    })
    .send()
    .then(response => {
        if (response.statusCode === 204) {
            // Dataset is successfully deleted.
        }
    });

datasetsService
    .listFeatures({
        datasetId: 'dataset-id'
    })
    .send()
    .then(response => {
        // $ExpectType FeatureCollection
        const collection = response.body;
    });

datasetsService
    .putFeature({
        datasetId: 'dataset-id',
        featureId: 'null-island',
        feature: {
            'type': 'Feature',
            'properties': { 'name': 'Null Island' },
            'geometry': {
                'type': 'Point',
                'coordinates': [0, 0]
            }
        }
    })
    .send()
    .then(response => {
        // $ExpectType Feature
        const feature = response.body;
    });

datasetsService
    .getFeature({
        datasetId: 'dataset-id',
        featureId: 'feature-id'
    })
    .send()
    .then(response => {
        // $ExpectType Feature
        const feature = response.body;
    });

datasetsService
    .deleteFeature({
        datasetId: 'dataset-id',
        featureId: 'feature-id'
    })
    .send()
    .then(response => {
        if (response.statusCode === 204) {
            // Feature is successfully deleted.
        }
    });

/**
 * Directions
 */

// $ExpectType DirectionsService
const directionsService = Directions(client);

directionsService
    .getDirections({
        profile: 'driving-traffic',
        waypoints: [
            {
                coordinates: [13.4301, 52.5109],
                approach: 'unrestricted'
            },
            {
                coordinates: [13.4265, 52.508]
            },
            {
                coordinates: [13.4194, 52.5072],
                bearing: [100, 60]
            }
        ]
    })
    .send()
    .then(response => {
        // $ExpectType DirectionsResponse
        const directions = response.body;
    });

/**
 * Geocoding
 */

// $ExpectType GeocodingService
const geocodingService = Geocoding(client);

geocodingService
    .forwardGeocode({
        query: 'Paris, France',
        limit: 2
    })
    .send()
    .then(response => {
        // $ExpectType ForwardGeocodingResponse
        const match = response.body;
    });

geocodingService
    .forwardGeocode({
        query: 'Paris, France',
        proximity: [-95.4431142, 33.6875431]
    })
    .send()
    .then(response => {
        // $ExpectType ForwardGeocodingResponse
        const match = response.body;
    });

geocodingService
    .forwardGeocode({
        query: 'Paris, France',
        countries: ['fr']
    })
    .send()
    .then(response => {
        // $ExpectType ForwardGeocodingResponse
        const match = response.body;
    });

geocodingService
    .forwardGeocode({
        query: 'Paris, France',
        bbox: [2.14, 48.72, 2.55, 48.96]
    })
    .send()
    .then(response => {
        // $ExpectType ForwardGeocodingResponse
        const match = response.body;
    });

geocodingService
    .reverseGeocode({
        query: [-95.4431142, 33.6875431]
    })
    .send()
    .then(response => {
        // $ExpectType ReverseGeocodingResponse
        const match = response.body;
    });

/**
 * Isochrone
 */

// $ExpectType IsochroneService
const isochroneService = Isochrone(client);

isochroneService
    .getContours({
        coordinates: [-118.22258, 33.99038],
        minutes: [5, 10, 15],
        profile: 'driving',
        colors: ['6706ce', '04e813', '4286f4'],
        polygons: true
    })
    .send()
    .then(response => {
        // $ExpectType IsochroneResponse
        const isochrones = response.body;
    });

/**
 * Map Matching
 */

// $ExpectType MapMatchingService
const mapMatchingService = MapMatching(client);

const stylesService: StylesService = Styles(config);
stylesService.putStyleIcon({
    styleId: 'style-id',
    iconId: 'icon-id',
    file: 'path-to-file.file'
});

const staticMapService: StaticMapService = StaticMap(client);
const geoOverlay: LineString = {
    type: 'LineString',
    coordinates: [[0, 1], [2, 3]]
};
staticMapService.getStaticImage({
    ownerId: 'owner-id',
    styleId: 'some-style',
    width: 16,
    height: 16,
    position: 'auto',
    overlays: [
        {
            geoJson: geoOverlay
        }
    ]
});

const tilesetsService: TilesetsService = Tilesets(client);
tilesetsService.listTilesets({ownerId: ''}).send().then(v => v.);
