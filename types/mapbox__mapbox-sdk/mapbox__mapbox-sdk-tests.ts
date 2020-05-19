import Client, { MapiClient, MapiClientConfig, MapiRequest, MapiResponse } from '@mapbox/mapbox-sdk';
import Datasets, { Dataset, DatasetsService } from '@mapbox/mapbox-sdk/services/datasets';
import Directions, { DirectionsService, DirectionsResponse } from '@mapbox/mapbox-sdk/services/directions';
import Styles, { StylesService } from '@mapbox/mapbox-sdk/services/styles';
import StaticMap, { StaticMapService } from '@mapbox/mapbox-sdk/services/static';
import { LineString } from 'geojson';
import Tilesets, { TilesetsService } from '@mapbox/mapbox-sdk/services/tilesets';

// MapiClient
const config: MapiClientConfig = {
    accessToken: 'access-token',
};
const client: MapiClient = Client(config);

// DatasetsService
const datasetsService: DatasetsService = Datasets(client);

datasetsService
    .listDatasets()
    .send()
    .then(response => {
        const datasets: Dataset[] = response.body;
        const count = datasets.length;
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
        const dataset: Dataset = response.body;
        const created = dataset.created;
        const name = dataset.name;
    });

datasetsService
    .getMetadata({
        datasetId: 'dataset-id'
    })
    .send()
    .then(response => {
        const dataset: Dataset = response.body;
        const features = dataset.features;
        const size = dataset.size;
    });

datasetsService
    .updateMetadata({
        datasetId: 'dataset-id',
        name: 'foo'
    })
    .send()
    .then(response => {
        const dataset: Dataset = response.body;
        const bounds = dataset.bounds;
        const owner = dataset.owner;
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
        const collection = response.body;
        const bbox = collection.bbox;

        for (const feature of collection.features) {
            // List each feature.
        }
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
        const feature = response.body;
        const geometry = feature.geometry;
        const properties = feature.properties;
    });

datasetsService
    .getFeature({
        datasetId: 'dataset-id',
        featureId: 'feature-id'
    })
    .send()
    .then(response => {
        const feature = response.body;
        const geometry = feature.geometry;
        const properties = feature.properties;
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

// DirectionsService
const directionsService: DirectionsService = Directions(client);

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
      const directions = response.body;

      for (const waypoint of directions.waypoints) {
          // List each waypoint.
      }

      for (const route of directions.routes) {
          for (const leg of route.legs) {
              for (const step of leg.steps) {
                  // List each route step.
              }
          }
      }
    });

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
