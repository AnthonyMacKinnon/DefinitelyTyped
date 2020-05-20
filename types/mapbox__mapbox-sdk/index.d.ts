// Type definitions for @mapbox/mapbox-sdk 0.10
// Project: https://github.com/mapbox/mapbox-sdk-js
// Definitions by: Jeff Dye <https://github.com/jeffbdye>
//                 Mike O'Meara <https://github.com/mikeomeara1>
//                 chachan <https://github.com/chachan>
//                 Anthony MacKinnon <https://github.com/AnthonyMacKinnon>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.0

declare module '@mapbox/mapbox-sdk' {
    export default function Client(config: MapiClientConfig): MapiClient;

    /**
     * A low-level Mapbox API client. Use it to create service clients
     * that share the same configuration.
     *
     * Services and `MapiRequest`s use the underlying `MapiClient` to
     * determine how to create, send, and abort requests in a way
     * that is appropriate to the configuration and environment
     * (Node or the browser).
     */
    interface MapiClient extends MapiClientConfig {
        createRequest<TResponse = any>(requestOptions: any): MapiRequest<TResponse>;
    }

    interface MapiClientConfig {
        /**
         * The Mapbox access token assigned to this client.
         */
        accessToken: string;

        /**
         * The origin to use for API requests. Defaults to https://api.mapbox.com.
         */
        origin?: string;
    }

    interface EventEmitter<TResponse> {
        /**
         * Listeners will be called with a `MapiResponse`.
         */
        response: MapiResponse<TResponse>;

        /**
         * Listeners will be called with a `MapiError`.
         */
        error: MapiError<TResponse>;

        /**
         * Listeners will be called with `ProgressEvents`.
         */
        downloadProgress: ProgressEvent;

        /**
         * Listeners will be called with `ProgressEvents`. Upload events are only available
         * when the request includes a file.
         */
        uploadProgress: ProgressEvent;
    }

    /**
     * A Mapbox API request.
     *
     * Note that creating a `MapiRequest` does *not* send the request automatically.
     * Use the request's `send` method to send it off and get a `Promise`.
     */
    interface MapiRequest<TResponse = any> {
        /**
         * An event emitter.
         */
        emitter: EventEmitter<TResponse>;

        /**
         * This request's `MapiClient`.
         */
        client: MapiClient;

        /**
         * If this request has been sent and received a response, the response is available on this property.
         */
        response?: MapiResponse<TResponse>;

        /**
         * If this request has been sent and received an error in response, the error is available on this property.
         */
        error?: MapiError<TResponse> | Error;

        /**
         * If the request has been aborted (via [`abort`](#abort)), this property will be `true`.
         */
        aborted: boolean;

        /**
         * If the request has been sent, this property will be `true`.
         * You cannot send the same request twice, so if you need to create a new request
         * that is the equivalent of an existing one, use [`clone`](#clone).
         */
        sent: boolean;

        /**
         * The request's path, including colon-prefixed route parameters.
         */
        path: string;

        /**
         * The request's origin.
         */
        origin: string;

        /**
         * The request's HTTP method.
         */
        method: string;

        /**
         * A query object, which will be transformed into a URL query string.
         */
        query: any;

        /**
         * A route parameters object, whose values will be interpolated the path.
         */
        params: any;

        /**
         * The request's headers.
         */
        headers: any;

        /**
         * Data to send with the request. If the request has a body, it will also be sent with
         * the header `'Content-Type: application/json'`.
         */
        body?: TResponse;

        /**
         * A file to send with the request. The browser client accepts Blobs and ArrayBuffers;
         * the Node client accepts strings (filepaths) and ReadStreams.
         */
        file: Blob | ArrayBuffer | string;

        /**
         * The encoding of the response.
         */
        encoding: string;

        /**
         * The method to send the `file`. Options are `data` (x-www-form-urlencoded) or `form` (multipart/form-data).
         */
        sendFileAs: string;

        /**
         * Get the URL of the request.
         *
         * @param {string} [accessToken] - By default, the access token of the request's client is used.
         * @return {string}
         */
        url(accessToken?: string): string;

        /**
         * Send the request. Returns a Promise that resolves with a `MapiResponse`.
         * You probably want to use `response.body`.
         *
         * `send` only retrieves the first page of paginated results. You can get
         * the next page by using the `MapiResponse`'s [`nextPage`](#nextpage)
         * function, or iterate through all pages using [`eachPage`](#eachpage)
         * instead of `send`.
         *
         * @returns {Promise<MapiResponse<TResponse>>}
         */
        send(): Promise<MapiResponse<TResponse>>;

        /**
         * Abort the request.
         *
         * Any pending `Promise` returned by [`send`](#send) will be rejected with
         * an error with `type: 'RequestAbortedError'`. If you've created a request
         * that might be aborted, you need to catch and handle such errors.
         *
         * This method will also abort any requests created while fetching subsequent
         * pages via [`eachPage`](#eachpage).
         *
         * If the request has not been sent or has already been aborted, nothing
         * will happen.
         */
        abort(): void;

        /**
         * Invoke a callback for each page of a paginated API response.
         *
         * The callback should have the following signature:
         *
         * ```js
         * (
         *   error: MapiError,
         *   response: MapiResponse,
         *   next: () => void
         * ) => void
         * ```
         *
         * **The next page will not be fetched until you've invoked the
         * `next` callback**, indicating that you're ready for it.
         *
         * @param {Function} callback
         */
        eachPage(callback: (
            error: MapiError<TResponse>,
            response: MapiResponse<TResponse>,
            next: () => void
        ) => void): void;

        /**
         * Clone this request.
         *
         * Each request can only be sent *once*. So if you'd like to send the
         * same request again, clone it and send away.
         *
         * @returns {MapiRequest<TResponse>} - A new `MapiRequest` configured just like this one.
         */
        clone(): MapiRequest<TResponse>;
    }

    /**
     * A Mapbox API response.
     */
    interface MapiResponse<TResponse> {
        /**
         * The response body, parsed as JSON.
         */
        body: TResponse;

        /**
         * The raw response body.
         */
        rawBody: string;

        /**
         * The response's status code.
         */
        statusCode: number;

        /**
         * The parsed response headers.
         */
        headers: any;

        /**
         * The parsed response links.
         */
        links: any;

        /**
         * The response's originating `MapiRequest`.
         */
        request: MapiRequest<TResponse>;

        /**
         * Check if there is a next page that you can fetch.
         *
         * @returns {boolean}
         */
        hasNextPage(): boolean;

        /**
         * Create a request for the next page, if there is one.
         * If there is no next page, returns `null`.
         *
         * @returns {MapiRequest<TResponse> | null}
         */
        nextPage(): MapiRequest<TResponse>;
    }

    /**
     * A Mapbox API error.
     *
     * If there's an error during the API transaction,
     * the Promise returned by `MapiRequest`'s [`send`](#send)
     * method should reject with a `MapiError`.
     */
    interface MapiError<TResponse> {
        /**
         * The errored request.
         */
        request: MapiRequest<TResponse>;

        /**
         * The type of error. Usually this is `'HttpError'`. If the request was aborted,
         * so the error was not sent from the server, the type will be `'RequestAbortedError'`.
         */
        type: string;

        /**
         * The numeric status code of the HTTP response.
         */
        statusCode?: number;

        /**
         * If the server sent a response body, this property exposes that response,
         * parsed as JSON if possible.
         */
        body?: any;

        /**
         * Whatever message could be derived from the call site and HTTP response.
         */
        message?: string;
    }
}

declare module '@mapbox/mapbox-sdk/services/datasets' {
    import { Feature, FeatureCollection } from 'geojson';
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';

    export default function Datasets(clientOrConfig: MapiClient | MapiClientConfig): DatasetsService;

    /**
     * Datasets API service.
     *
     * Learn more about this service and its responses in
     * [the HTTP service documentation](https://docs.mapbox.com/api/maps/#datasets).
     */
    interface DatasetsService {
        /**
         * List datasets in your account.
         *
         * See the [corresponding HTTP service documentation](https://docs.mapbox.com/api/maps/#list-datasets).
         *
         * @return {MapiRequest<Dataset[]>}
         *
         * @example
         * datasetsClient.listDatasets()
         *   .send()
         *   .then(response => {
         *     const datasets = response.body;
         *   });
         *
         * @example
         * datasetsClient.listDatasets()
         *   .eachPage((error, response, next) => {
         *     // Handle error or response and call next.
         *   });
         */
        listDatasets(): MapiRequest<Dataset[]>;

        /**
         * Create a new, empty dataset.
         *
         * See the [corresponding HTTP service documentation](https://docs.mapbox.com/api/maps/#create-a-dataset).
         *
         * @param {Object} config
         * @return {MapiRequest<Dataset>}
         *
         * @example
         * datasetsClient.createDataset({
         *   name: 'example',
         *   description: 'An example dataset'
         * })
         *   .send()
         *   .then(response => {
         *     const datasetMetadata = response.body;
         *   });
         */
        createDataset(config: {
            /**
             * The name of the dataset.
             */
            name?: string;

            /**
             * A description of the dataset.
             */
            description?: string
        }): MapiRequest<Dataset>;

        /**
         * Get metadata about a dataset.
         *
         * See the [corresponding HTTP service documentation](https://docs.mapbox.com/api/maps/#retrieve-a-dataset).
         *
         * @param {Object} config
         * @return {MapiRequest<Dataset>}
         *
         * @example
         * datasetsClient.getMetadata({
         *   datasetId: 'dataset-id'
         * })
         *   .send()
         *   .then(response => {
         *     const datasetMetadata = response.body;
         *   })
         */
        getMetadata(config: {
            /**
             * The ID of the dataset to be retrieved.
             */
            datasetId: string
        }): MapiRequest<Dataset>;

        /**
         * Update user-defined properties of a dataset's metadata.
         *
         * See the [corresponding HTTP service documentation](https://docs.mapbox.com/api/maps/#update-a-dataset).
         *
         * @param {Object} config
         * @return {MapiRequest<Dataset>}
         *
         * @example
         * datasetsClient.updateMetadata({
         *   datasetId: 'dataset-id',
         *   name: 'foo'
         * })
         *   .send()
         *   .then(response => {
         *     const datasetMetadata = response.body;
         *   });
         */
        updateMetadata(config: {
            /**
             * The ID of the dataset to be updated.
             */
            datasetId: string;

            /**
             * The name of the dataset.
             */
            name?: string;

            /**
             * A description of the dataset.
             */
            description?: string
        }): MapiRequest<Dataset>;

        /**
         * Delete a dataset, including all features it contains.
         *
         * See the [corresponding HTTP service documentation](https://docs.mapbox.com/api/maps/#delete-a-dataset).
         *
         * @param {Object} config
         * @return {MapiRequest<void>}
         *
         * @example
         * datasetsClient.deleteDataset({
         *   datasetId: 'dataset-id'
         * })
         *   .send()
         *   .then(response => {
         *     // Dataset is successfully deleted.
         *   });
         */
        deleteDataset(config: {
            /**
             * The ID of the dataset to be deleted.
             */
            datasetId: string
        }): MapiRequest<void>;

        /**
         * List features in a dataset.
         *
         * This endpoint supports pagination. Use `MapiRequest#eachPage` or manually specify
         * the `limit` and `start` options.
         *
         * See the [corresponding HTTP service documentation](https://docs.mapbox.com/api/maps/#list-features).
         *
         * @param {Object} config
         * @return {MapiRequest<FeatureCollection>}
         *
         * @example
         * datasetsClient.listFeatures({
         *   datasetId: 'dataset-id'
         * })
         *   .send()
         *   .then(response => {
         *     const features = response.body;
         *   });
         */
        listFeatures(config: {
            /**
             * The ID of the dataset for which to retrieve features.
             */
            datasetId: string;

            /**
             * The maximum number of features to return, from `1` to `100`. The default is `10`.
             */
            limit?: number;

            /**
             * The ID of the feature after which to start the listing. The feature ID is found in the `Link` header
             * of a response. See the [pagination](https://docs.mapbox.com/api/#pagination) section for details.
             */
            start?: string
        }): MapiRequest<FeatureCollection>;

        /**
         * Add a feature to a dataset or update an existing one.
         *
         * See the
         * [corresponding HTTP service documentation](https://docs.mapbox.com/api/maps/#insert-or-update-a-feature).
         *
         * @param {Object} config
         * @return {MapiRequest<Feature>}
         *
         * @example
         * datasetsClient.putFeature({
         *   datasetId: 'dataset-id',
         *   featureId: 'null-island',
         *   feature: {
         *     "type": "Feature",
         *     "properties": { "name": "Null Island" },
         *     "geometry": {
         *       "type": "Point",
         *       "coordinates": [0, 0]
         *     }
         *   }
         * })
         *   .send()
         *   .then(response => {
         *     const feature = response.body;
         *   });
         */
        putFeature(config: {
            /**
             * The ID of the dataset for which to insert or update features.
             */
            datasetId: string;

            /**
             * The ID of the feature to be inserted or updated.
             */
            featureId: string;

            /**
             * Valid GeoJSON that is not a `FeatureCollection`. If the feature has a top-level
             * `id` property, it must match the `featureId` you specify.
             */
            feature: Feature
        }): MapiRequest<Feature>;

        /**
         * Get a feature in a dataset.
         *
         * See the [corresponding HTTP service documentation](https://docs.mapbox.com/api/maps/#retrieve-a-feature).
         *
         * @param {Object} config
         * @return {MapiRequest<Feature>}
         *
         * @example
         * datasetsClient.getFeature({
         *   datasetId: 'dataset-id',
         *   featureId: 'feature-id'
         * })
         *   .send()
         *   .then(response => {
         *     const feature = response.body;
         *   });
         */
        getFeature(config: {
            /**
             * The ID of the dataset from which to retrieve a feature.
             */
            datasetId: string;

            /**
             * The ID of the feature to be retrieved.
             */
            featureId: string
        }): MapiRequest<Feature>;

        /**
         * Delete a feature in a dataset.
         *
         * See the [corresponding HTTP service documentation](https://docs.mapbox.com/api/maps/#delete-a-feature).
         *
         * @param {Object} config
         * @return {MapiRequest<void>}
         *
         * @example
         * datasetsClient.deleteFeature({
         *   datasetId: 'dataset-id',
         *   featureId: 'feature-id'
         * })
         *   .send()
         *   .then(response => {
         *     // Feature is successfully deleted.
         *   });
         */
        deleteFeature(config: {
            /**
             * The ID of the dataset from which to delete a feature.
             */
            datasetId: string;

            /**
             * The ID of the feature to be deleted.
             */
            featureId: string
        }): MapiRequest<void>;
    }

    /**
     * The dataset object contains information pertinent to a specific dataset.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/maps/#the-dataset-object).
     */
    interface Dataset {
        /**
         * The username of the dataset owner.
         */
        owner: string;

        /**
         * The ID for an existing dataset.
         */
        id: string;

        /*
         * A timestamp indicating when the dataset was created.
         */
        created: string;

        /*
         * A timestamp indicating when the dataset was last modified.
         */
        modified: string;

        /**
         * The extent of features in the dataset in the format [`west`, `south`, `east`, `north`].
         */
        bounds: [number, number, number, number];

        /**
         * The number of features in the dataset.
         */
        features: number;

        /**
         * The size of the dataset in bytes.
         */
        size: number;

        /**
         * The name of the dataset.
         */
        name?: string;

        /**
         * A description of the dataset.
         */
        description?: string;
    }
}

declare module '@mapbox/mapbox-sdk/services/directions' {
    import { LineString } from 'geojson';
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';

    export default function Directions(clientOrConfig: MapiClient | MapiClientConfig): DirectionsService;

    /**
     * Directions API service.
     *
     * Learn more about this service and its responses in
     * [the HTTP service documentation](https://docs.mapbox.com/api/navigation/#directions).
     */
    interface DirectionsService {
        /**
         * Get directions.
         *
         * Please read [the full HTTP service documentation](https://docs.mapbox.com/api/navigation/#directions)
         * to understand all of the available options.
         *
         * @param {Object} config
         * @return {MapiRequest<DirectionsResponse>}
         *
         * @example
         * directionsClient.getDirections({
         *   profile: 'driving-traffic',
         *   waypoints: [
         *     {
         *       coordinates: [13.4301, 52.5109],
         *       approach: 'unrestricted'
         *     },
         *     {
         *       coordinates: [13.4265, 52.508]
         *     },
         *     {
         *       coordinates: [13.4194, 52.5072],
         *       bearing: [100, 60]
         *     }
         *   ]
         * })
         *   .send()
         *   .then(response => {
         *     const directions = response.body;
         *   });
         */
        getDirections(config: {
            /**
             * Default: `'driving'`.
             */
            profile?: RoutingProfile;

            /**
             * An ordered array of [`DirectionsWaypoint`](#directionswaypoint) objects,
             * between 2 and 25 (inclusive).
             */
            waypoints: DirectionsWaypoint[];

            /**
             * Whether to try to return alternative routes. Default: `false`.
             */
            alternatives?: boolean;

            /**
             * Specify additional metadata that should be returned.
             */
            annotations?: DirectionsAnnotation[];

            /**
             * Should be used in conjunction with `steps`. Default: `false`.
             */
            bannerInstructions?: boolean;

            /**
             * Sets the allowed direction of travel when departing intermediate waypoints.
             */
            continueStraight?: boolean;

            /**
             * Exclude certain road types from routing. See HTTP service documentation for options.
             */
            exclude?: Extract<DirectionsClass, 'toll' | 'motorway' | 'ferry'>;

            /**
             * Format of the returned geometry. Default: `'polyline'`.
             */
            geometries?: DirectionsGeometry;

            /**
             * Language of returned turn-by-turn text instructions. See options listed in
             * [the HTTP service documentation](https://docs.mapbox.com/api/navigation/#instructions-languages).
             * Default: `'en'`.
             */
            language?: string;

            /**
             * Type of returned overview geometry. Default: `'simplified'`.
             */
            overview?: DirectionsOverview;

            /**
             * Emit instructions at roundabout exits. Default: `false`.
             */
            roundaboutExits?: boolean;

            /**
             * Whether to return steps and turn-by-turn instructions. Default: `false`.
             */
            steps?: boolean;

            /**
             * Whether or not to return SSML marked-up text for voice guidance along the route. Default: `false`.
             */
            voiceInstructions?: boolean;

            /**
             * Which type of units to return in the text for voice instructions. Default: `'imperial'`.
             */
            voiceUnits?: DirectionsUnits;
        }): MapiRequest<DirectionsResponse>;
    }

    type RoutingProfile = 'driving-traffic' | 'driving' | 'walking' | 'cycling';

    type DirectionsApproach = 'unrestricted' | 'curb';
    type DirectionsAnnotation = 'duration' | 'distance' | 'speed' | 'congestion';
    type DirectionsGeometry = 'geojson' | 'polyline' | 'polyline6';
    type DirectionsOverview = 'full' | 'simplified' | 'false';
    type DirectionsUnits = 'imperial' | 'metric';
    type DirectionsSide = 'left' | 'right';
    type DirectionsMode = 'driving' | 'walking' | 'cycling' | 'train' | 'ferry' | 'unaccessible';
    type DirectionsClass = 'toll' | 'ferry' | 'restricted' | 'motorway' | 'tunnel';
    type ManeuverModifier =
        | 'uturn'
        | 'sharp right'
        | 'right'
        | 'slight right'
        | 'straight'
        | 'slight left'
        | 'left'
        | 'sharp left';
    type ManeuverType =
        | 'turn'
        | 'new name'
        | 'depart'
        | 'arrive'
        | 'merge'
        | 'on ramp'
        | 'off ramp'
        | 'fork'
        | 'end of road'
        | 'continue'
        | 'roundabout'
        | 'rotary'
        | 'roundabout turn'
        | 'notification'
        | 'exit roundabout'
        | 'exit rotary';

    interface DirectionsWaypoint {
        coordinates: [number, number];

        /**
         * Used to indicate how requested routes consider from which side of the road to approach the waypoint.
         * Default: `'unrestricted'`.
         */
        approach?: DirectionsApproach;

        /**
         * Used to filter the road segment the waypoint will be placed on by direction and dictates the angle
         * of approach. This option should always be used in conjunction with a `radius`. The first value is
         * an angle clockwise from true north between 0 and 360, and the second is the range of degrees the
         * angle can deviate by.
         */
        bearing?: [number, number];

        /**
         * Maximum distance in meters that the coordinate is allowed to move when snapped to a nearby road segment.
         */
        radius?: number | 'unlimited';

        /**
         * Custom name for the waypoint used for the arrival instruction in banners and voice instructions.
         */
        waypointName?: string;
    }

    /**
     * The response to a Directions API request.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/navigation/#response-retrieve-directions).
     */
    interface DirectionsResponse {
        /**
         * An array of route objects ordered by descending recommendation rank.
         * The response object may contain at most two routes.
         */
        routes: Route[];

        /**
         * An array of waypoint objects. Each waypoint is an input coordinate snapped to the road and path
         * network. The waypoints appear in the array in the order of the input coordinates.
         */
        waypoints: Waypoint[];

        /**
         * A string indicating the state of the response. This is a different code than the HTTP status code.
         * On normal valid responses, the value will be Ok. For other responses, see the
         * [Directions API errors table](https://docs.mapbox.com/api/navigation/#directions-api-errors).
         */
        code: string;

        uuid: string;
    }

    /**
     * The waypoint object represents an input coordinate snapped to the roads network.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/navigation/#waypoint-object).
     */
    interface Waypoint {
        /**
         * A string with the name of the road or path to which the input coordinate has been snapped.
         */
        name: string;

        /**
         * An array containing the `[longitude, latitude]` of the snapped coordinate.
         */
        location: [number, number];

        /**
         * The straight-line distance from the coordinate specified in the query to the location it was snapped to.
         */
        distance?: number;
    }

    /**
     * A route object describes a route through multiple waypoints.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/navigation/#route-object).
     */
    interface Route {
        /**
         * A float indicating the estimated travel time through the waypoints in seconds.
         */
        duration: number;

        /**
         * A float indicating the distance traveled through the waypoints in meters.
         */
        distance: number;

        /**
         * A string indicating which weight was used. The default is `routability`, which is duration-based,
         * with additional penalties for less desirable maneuvers.
         */
        weight_name: string;

        /**
         * A float indicating the weight in units described by `weight_name`.
         */
        weight: number;

        /**
         * Depending on the `geometries` query parameter, this is either a
         * [GeoJSON LineString](https://tools.ietf.org/html/rfc7946#appendix-A.2) or a
         * [Polyline string](https://developers.google.com/maps/documentation/utilities/polylinealgorithm).
         * Depending on the `overview` query parameter, this is the complete route geometry (`full`), a simplified
         * geometry to the zoom level at which the route can be displayed in full (`simplified`), or is not
         * included (`false`).
         */
        geometry: LineString | string;

        /**
         * An array of route leg objects.
         */
        legs: RouteLeg[];

        /**
         * A string of the locale used for voice instructions. Defaults to `en` (English). Can be any
         * [accepted instruction language](https://docs.mapbox.com/api/navigation/#instructions-languages).
         * `voiceLocale` is only present in the response when `voice_instructions=true`.
         */
        voiceLocale?: string;
    }

    /**
     * A route object contains a nested route leg object for each leg of the journey,
     * which is one fewer than the number of input coordinates.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/navigation/#route-leg-object).
     */
    interface RouteLeg {
        /**
         * A number indicating the distance traveled between waypoints in meters.
         */
        distance: number;

        /**
         * A number indicating the estimated travel time between waypoints in seconds.
         */
        duration: number;

        /**
         * Depending on the optional `steps` parameter, either an array of route step objects (`steps=true`)
         * or an empty array (`steps=false`, default).
         */
        steps: RouteStep[];

        /**
         * A string summarizing the route.
         */
        summary: string;

        /**
         * An annotations object that contains additional details about each line segment along the route geometry.
         * Each entry in an annotations field corresponds to a coordinate along the route geometry.
         */
        annotation: {
            /**
             * The distance between each pair of coordinates in meters.
             */
            distance: number[];

            /**
             * The duration between each pair of coordinates in seconds.
             */
            duration: number[];

            /**
             * The average speed used in the calculation between the two points in each pair of coordinates in
             * meters per second.
             */
            speed: number[];

            /**
             * The level of congestion, described as `severe`, `heavy`, `moderate`, `low` or `unknown`, between each
             * entry in the array of coordinate pairs in the route leg. For any profile other than `mapbox/driving-traffic`
             * a list of `unknown`s will be returned. A list of `unknown`s will also be returned if the route is very long.
             */
            congestion: ('severe' | 'heavy' | 'moderate' | 'low' | 'unknown')[];
        };

        /**
         * A float indicating the weight in units described by `weight_name`.
         */
        weight: number;
    }

    /**
     * In a route leg object, a nested route step object includes one step maneuver object as well as information
     * about travel to the following route step.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/navigation/#route-step-object).
     */
    interface RouteStep {
        /**
         * One step maneuver object.
         */
        maneuver: StepManeuver;

        /**
         * A number indicating the distance traveled in meters from the maneuver to the next route step.
         */
        distance: number;

        /**
         * A number indicating the estimated time traveled in seconds from the maneuver to the next route step.
         */
        duration: number;

        /**
         * Depending on the geometries parameter, this is a
         * [GeoJSON LineString](https://tools.ietf.org/html/rfc7946#appendix-A.2) or a
         * [Polyline string](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
         * representing the full route geometry from this route step to the next route step.
         */
        geometry: LineString | string;

        /**
         * A string with the name of the road or path that forms part of the route step.
         */
        name: string;

        /**
         * Any road designations associated with the road or path leading from this step’s maneuver to the next step’s
         * maneuver. If multiple road designations are associated with the road, they are separated by semicolons.
         * Typically consists of an alphabetic network code (identifying the road type or numbering system), a space or
         * hyphen, and a route number. Optionally included, if data is available. **Note:** A network code is not
         * necessarily globally unique, and should not be treated as though it is. A route number may not uniquely
         * identify a road within a given network.
         */
        ref?: string;

        /**
         * A string with the destinations of the road or path along which the travel proceeds.
         * Optionally included, if data is available.
         */
        destinations?: string;

        /**
         * A string with the exit numbers or names of the road or path. Optionally included, if data is available.
         */
        exits?: string;

        /**
         * The legal driving side at the location for this step. Either `left` or `right`.
         */
        driving_side: DirectionsSide;

        /**
         * A string indicating the mode of transportation.
         */
        mode: DirectionsMode;

        /**
         * A string containing an [IPA](https://en.wikipedia.org/wiki/International_Phonetic_Alphabet) phonetic
         * transcription indicating how to pronounce the name in the `name` property. Omitted if pronunciation
         * data is not available for the step.
         */
        pronunciation?: string;

        /**
         * Array of objects representing all intersections along the step.
         */
        intersections: Intersection[];

        /**
         * A float indicating the weight in units described by `weight_name`.
         */
        weight: number;

        /**
         * An array of voice instruction objects.
         */
        voiceInstructions: VoiceInstruction[];

        /**
         * An array of banner instruction objects.
         */
        bannerInstructions: BannerInstruction[];
    }

    /**
     * A route step object contains a nested step maneuver object.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/navigation/#step-maneuver-object).
     */
    interface StepManeuver {
        /**
         * A number between `0` and `360` indicating the clockwise angle from true north to the direction of travel
         * immediately _before_ the maneuver.
         */
        bearing_before: number;

        /**
         * A number between `0` and `360` indicating the clockwise angle from true north to the direction of travel
         * immediately _after_ the maneuver.
         */
        bearing_after: number;

        /**
         * A human-readable instruction of how to execute the returned maneuver.
         */
        instruction: string;

        /**
         * An array of `[longitude, latitude]` coordinates for the point of the maneuver.
         */
        location: [number, number];

        /**
         * An optional string indicating the direction change of the maneuver. The meaning of each
         * modifier depends on the type property.
         */
        modifier?: ManeuverModifier;

        /**
         * A string indicating the type of maneuver. See the full list of maneuver types in the
         * [maneuver types table](https://docs.mapbox.com/api/navigation/#maneuver-types).
         */
        type: ManeuverType;
    }

    interface Intersection {
        /**
         * A `[longitude, latitude]` pair describing the location of the turn.
         */
        location: [number, number];

        /**
         * A list of bearing values that are available at the intersection.The bearings describe all available roads
         * at the intersection.
         */
        bearings: number[];

        /**
         * An array of strings signifying the classes of the road exiting the intersection.
         */
        classes?: DirectionsClass[];

        /**
         * A list of entry flags, corresponding with the entries in `bearings`. If `true`, indicates that the
         * respective road could be entered on a valid route. If `false`, the turn onto the respective road
         * would violate a restriction.
         */
        entry: boolean[];

        /**
         * The zero-based index for the intersection. This value can be used to apply the duration annotation
         * that corresponds with the intersection. Only available on the `driving` profile.
         */
        geometry_index?: number;

        /**
         * The index in the `bearings` and `entry` arrays. Used to calculate the bearing before the turn.
         * Namely, the clockwise angle from true north to the direction of travel before the maneuver/passing
         * the intersection. To get the bearing in the direction of driving, the bearing has to be rotated by
         * a value of 180. The value is not supplied for departure maneuvers.
         */
        in?: number;

        /**
         * The index in the `bearings` and `entry` arrays. Used to extract the bearing after the turn.
         * Namely, the clockwise angle from true north to the direction of travel after the maneuver/passing
         * the intersection. The value is not supplied for arrival maneuvers.
         */
        out?: number;

        /**
         * An array of lane objects that represent the available turn lanes at the intersection. If no lane
         * information is available for an intersection, the `lanes` property will not be present.
         */
        lanes?: Lane[];

        /**
         * A number indicating the time required, in seconds, to traverse the intersection.
         * Only available on the `driving` profile.
         */
        duration?: number;
    }

    /**
     * A route step object contains a nested lane object. The lane object describes the available turn lanes
     * at an intersection. Lanes are provided in their order on the street, from left to right.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/navigation/#lane-object).
     */
    interface Lane {
        /**
         * Indicates whether a lane can be taken to complete the maneuver (`true`) or not (`false`).
         * For instance, if the lane array has four objects and the first two are valid, the driver can
         * take either of the left lanes and stay on the route.
         */
        valid: boolean;

        /**
         * An array of indications (based on signs, road markings, or both) for each turn lane. A road can have
         * multiple indications. For example, a turn lane can have a sign with an arrow pointing left and another
         * arrow pointing straight.
         */
        indications: ('none' | ManeuverModifier)[];
    }

    /**
     * A route step object contains a nested voice instruction object if the optional `voice_instructions=true`
     * query parameter is present. The voice instruction object contains the text that should be announced,
     * along with how far from the maneuver it should be emitted. The system will announce the instructions
     * during the route step in which the voice instruction object is nested, but the instructions refer to the
     * maneuver in the _following_ step.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/navigation/#voice-instruction-object).
     */
    interface VoiceInstruction {
        /**
         * A float indicating how far from the upcoming maneuver the voice instruction should begin in meters.
         */
        distanceAlongGeometry: number;

        /**
         * A string containing the text of the verbal instruction.
         */
        announcement: string;

        /**
         * A string with SSML markup for proper text and pronunciation. This property is designed for use with
         * [Amazon Polly](https://aws.amazon.com/polly/). The SSML tags may not work with other text-to-speech engines.
         */
        ssmlAnnouncement: string;
    }

    /**
     * A route step object contains a nested banner instruction object if the optional `banner_instructions=true`
     * query parameter is present. The banner instruction object contains the contents of a banner that should be
     * displayed as added visual guidance for a route. The banner instructions are children of the route steps during
     * which they should be displayed, but they refer to the maneuver in the `following` step.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/navigation/#banner-instruction-object).
     */
    interface BannerInstruction {
        /**
         * A float indicating how far from the upcoming maneuver the banner instruction should begin being
         * displayed in meters. Only one banner should be displayed at a time.
         */
        distanceAlongGeometry: number;

        /**
         * The most important content to display to the user. This text is larger and at the top.
         */
        primary: BannerInstructionContent;

        /**
         * Additional content useful for visual guidance. This text is slightly smaller and below `primary`.
         * Can be `null`.
         */
        secondary?: BannerInstructionContent;

        /**
         * Additional information that is included if the driver needs to be notified about something. Can include
         * information about the _next_ maneuver (the one after the upcoming one) if the step is short. If lane
         * information is available, that takes precedence over information about the _next_ maneuver.
         */
        sub?: BannerInstructionContent;

        then?: any;
    }

    interface BannerInstructionContent {
        /**
         * A string that contains all the text that should be displayed.
         */
        text: string;

        /**
         * The type of maneuver. May be used in combination with the `modifier` (and, if it is a roundabout,
         * the `degrees`) for an icon to display. Possible values: `turn`, `merge`, `depart`, `arrive`, `fork`,
         * `off ramp`, and `roundabout`.
         */
        type?: ManeuverType;

        /**
         * The modifier for the maneuver. Can be used in combination with the `type` (and, if it is a roundabout,
         * the `degrees`) for an icon to display.
         */
        modifier?: ManeuverModifier;

        /**
         * The degrees at which you will be exiting a roundabout, assuming `180` indicates going straight
         * through the roundabout.
         */
        degrees?: number;

        /**
         * A string representing which side the of the street people drive on in that location.
         * Can be `left` or `right`.
         */
        driving_side?: DirectionsSide;

        /**
         * Objects that, together, make up what should be displayed in the banner.
         * Includes additional information intended to be used to aid in visual layout.
         */
        components: BannerInstructionComponent[];
    }

    interface BannerInstructionComponent {
        /**
         * A string with more context about the component that may help in visual markup and display choices.
         * If the type of the component is unknown, it should be treated as text.
         */
        type?: 'text' | 'icon' | 'delimiter' | 'exit-number' | 'exit' | 'lane';

        /**
         * The sub-string of the `text` of the parent objects that may have additional context associated with it.
         */
        text: string;

        /**
         * The abbreviated form of `text`. If this is present, there will also be an `abbr_priority` value.
         * For an example of using `abbr` and `abbr_priority`, see the
         * [abbreviation examples](https://docs.mapbox.com/api/navigation/#abbreviation-examples) table.
         */
        abbr?: string;

        /**
         * An integer indicating the order in which the abbreviation `abbr` should be used in place of `text`.
         * The highest priority is `0`, while a higher integer value means it should have a lower priority.
         * There are no gaps in integer values. Multiple components can have the same `abbr_priority`. When this
         * happens, all `components` with the same `abbr_priority` should be abbreviated at the same time.
         * Finding no larger values of `abbr_priority` means that the string is fully abbreviated.
         */
        abbr_priority?: number;

        /**
         * A string pointing to a shield image to use instead of the text. The shield image can be retrieved as an
         * SVG by appending `.svg` to the URL string, or it can be retrieved as a PNG at 1-3× pixel density by
         * appending `@1x|@2x|@3x.png` to the URL string.
         */
        imageBaseURL?: string;

        /**
         * An array indicating which directions you can go from a lane (left, right, or straight). If the value is
         * ['left', 'straight'], the driver can go straight or left from that lane. Present if `components.type`
         * is `lane`.
         */
        directions?: string[];

        /**
         * A boolean that tells you whether that lane can be used to complete the upcoming maneuver. If multiple
         * lanes are active, then they can all be used to complete the upcoming maneuver. Present if
         * `components.type` is `lane`.
         */
        active?: boolean;
    }
}

declare module '@mapbox/mapbox-sdk/services/geocoding' {
    import { Feature, FeatureCollection, GeoJsonProperties, Point } from 'geojson';
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';

    export default function Geocoding(clientOrConfig: MapiClient | MapiClientConfig): GeocodingService;

    /**
     * Geocoding API service.
     *
     * Learn more about this service and its responses in
     * [the HTTP service documentation](https://docs.mapbox.com/api/search/#geocoding).
     */
    interface GeocodingService {
        /**
         * Search for a place.
         *
         * See the [public documentation](https://docs.mapbox.com/api/search/#forward-geocoding).
         *
         * @param {Object} config
         * @return {MapiRequest<ForwardGeocodingResponse>}
         *
         * @example
         * geocodingClient.forwardGeocode({
         *   query: 'Paris, France',
         *   limit: 2
         * })
         *   .send()
         *   .then(response => {
         *     const match = response.body;
         *   });
         *
         * @example
         * // geocoding with proximity
         * geocodingClient.forwardGeocode({
         *   query: 'Paris, France',
         *   proximity: [-95.4431142, 33.6875431]
         * })
         *   .send()
         *   .then(response => {
         *     const match = response.body;
         *   });
         *
         * // geocoding with countries
         * geocodingClient.forwardGeocode({
         *   query: 'Paris, France',
         *   countries: ['fr']
         * })
         *   .send()
         *   .then(response => {
         *     const match = response.body;
         *   });
         *
         * // geocoding with bounding box
         * geocodingClient.forwardGeocode({
         *   query: 'Paris, France',
         *   bbox: [2.14, 48.72, 2.55, 48.96]
         * })
         *   .send()
         *   .then(response => {
         *     const match = response.body;
         *   });
         */
        forwardGeocode(config: {
            /**
             * A place name.
             */
            query: string;

            /**
             * Either `mapbox.places` for ephemeral geocoding, or `mapbox.places-permanent` for storing results
             * and batch geocoding. Default: `mapbox.places`.
             */
            mode?: GeocodingEndpoint;

            /**
             * Limits results to the specified countries. Each item in the array should be an
             * [ISO 3166 alpha 2 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
             */
            countries?: string[];

            /**
             * Bias local results based on a provided location.
             */
            proximity?: [number, number];

            /**
             * Filter results by feature types.
             */
            types?: GeocodingDataType[];

            /**
             * Return autocomplete results or not. Default: `true`.
             */
            autocomplete?: boolean;

            /**
             * Limit results to a bounding box.
             */
            bbox?: [number, number, number, number];

            /**
             * Limit the number of results returned. Default: `5`.
             */
            limit?: number;

            /**
             * Specify the language to use for response text and, for forward geocoding, query result weighting.
             * Options are [IETF language tags](https://en.wikipedia.org/wiki/IETF_language_tag) comprised of a
             * mandatory [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) and
             * optionally one or more IETF subtags for country or script.
             */
            language?: string[];

            /**
             * Specify whether to request additional metadata about the recommended navigation destination.
             * Only applicable for address features. Default: `false`.
             */
            routing?: boolean;
        }): MapiRequest<ForwardGeocodingResponse>;

        /**
         * Search for places near coordinates.
         *
         * See the [public documentation](https://docs.mapbox.com/api/search/#reverse-geocoding).
         *
         * @param {Object} config
         * @return {MapiRequest<ReverseGeocodingResponse>}
         *
         * @example
         * geocodingClient.reverseGeocode({
         *   query: [-95.4431142, 33.6875431]
         * })
         *   .send()
         *   .then(response => {
         *     // GeoJSON document with geocoding matches
         *     const match = response.body;
         *   });
         */
        reverseGeocode(config: {
            /**
             * Coordinates at which features will be searched.
             */
            query: [number, number];

            /**
             * Either `mapbox.places` for ephemeral geocoding, or `mapbox.places-permanent` for storing results
             * and batch geocoding. Default: `mapbox.places`.
             */
            mode?: GeocodingEndpoint;

            /**
             * Limits results to the specified countries. Each item in the array should be an
             * [ISO 3166 alpha 2 country code](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2).
             */
            countries?: string[];

            /**
             * Filter results by feature types.
             */
            types?: GeocodingDataType[];

            /**
             * Limit results to a bounding box.
             */
            bbox?: [number, number, number, number];

            /**
             * Limit the number of results returned. If using this option, you must provide a single item for `types`.
             * Default: `1`.
             */
            limit?: number;

            /**
             * Specify the language to use for response text and, for forward geocoding, query result weighting.
             * Options are [IETF language tags](https://en.wikipedia.org/wiki/IETF_language_tag) comprised of a
             * mandatory [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) and
             * optionally one or more IETF subtags for country or script.
             */
            language?: string[];

            /**
             * Set the factors that are used to sort nearby results. Default: `distance`.
             */
            reverseMode?: 'distance' | 'score';

            /**
             * Specify whether to request additional metadata about the recommended navigation destination.
             * Only applicable for address features. Default: `false`.
             */
            routing?: boolean;
        }): MapiRequest<ReverseGeocodingResponse>;
    }

    /**
     * The geocoding API includes two different endpoints.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/search/#endpoints).
     */
    type GeocodingEndpoint = 'mapbox.places' | 'mapbox.places-permanent';

    /**
     * Various types of geographic features are available in the Mapbox geocoder. Any type might appear as a top-level
     * response, as context in a top-level response, or as a filtering option using the `types` parameter. Not all
     * features are available or relevant in all parts of the world. New types are occasionally added as necessary to
     * correctly capture global administrative hierarchies.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/search/#data-types).
     */
    type GeocodingDataType =
        | 'country'
        | 'region'
        | 'postcode'
        | 'district'
        | 'place'
        | 'locality'
        | 'neighborhood'
        | 'address'
        | 'poi';

    type ForwardGeocodingResponse = GeocodingResponse<string[]>;
    type ReverseGeocodingResponse = GeocodingResponse<[number, number]>;

    /**
     * The response to a Geocoding API request.
     *
     * See the [corresponding documentation](https://docs.mapbox.com/api/search/#geocoding-response-object).
     */
    interface GeocodingResponse<TQuery> extends FeatureCollection<Point, GeocodingFeatureProperties> {
        /**
         * **Forward geocodes:** An array of space and punctuation-separated strings from the original query.
         *
         * **Reverse geocodes:** An array containing the coordinates being queried.
         */
        query: TQuery;

        /**
         * An array of feature objects.
         *
         * **Forward geocodes:** Returned features are ordered by `relevance`.
         *
         * **Reverse geocodes:** Returned features are ordered by index hierarchy, from most specific features to
         * least specific features that overlap the queried coordinates.
         *
         * Read the
         * [Search result prioritization](https://docs.mapbox.com/help/how-mapbox-works/geocoding/#search-result-prioritization)
         * guide to learn more about how returned features are organized in the Geocoding API response.
         */
        features: GeocodingFeature[];

        /**
         * A string that attributes the results of the Mapbox Geocoding API to Mapbox.
         */
        attribution: string;
    }

    interface GeocodingFeature extends Feature<Point, GeocodingFeatureProperties> {
        /**
         * A feature ID in the format `{type}.{id}` where `{type}` is the lowest hierarchy feature in the `place_type`
         * field. The `{id}` suffix of the feature ID is unstable and may change within versions.
         */
        id: string;

        /**
         * An array of feature types describing the feature. Options are `country`, `region`, `postcode`, `district`,
         * `place`, `locality`, `neighborhood`, `address`, and `poi`. Most features have only one type, but if the
         * feature has multiple types, all applicable types will be listed in the array. (For example, Vatican City
         * is a `country`, `region`, and `place`.)
         */
        place_type: GeocodingDataType[];

        /**
         * Indicates how well the returned feature matches the user's query on a scale from `0` to `1`. `0` means
         * the result does not match the query text at all, while `1` means the result fully matches the query text.
         * You can use the `relevance` property to remove results that don’t fully match the query. Learn more about
         * textual relevance in the
         * [Search result prioritization guide](https://docs.mapbox.com/help/how-mapbox-works/geocoding/#search-result-prioritization).
         */
        relevance: number;

        /**
         * A string of the house number for the returned `address` feature. Note that unlike the `address` property
         * for `poi` features, this property is outside the `properties` object.
         */
        address?: string;

        /**
         * A string representing the feature in the requested language, if specified.
         */
        text: string;

        /**
         * A string representing the feature in the requested language, if specified, and its full result hierarchy.
         */
        place_name: string;

        /**
         * A string analogous to the `text` field that more closely matches the query than results in the specified
         * language. For example, querying `Köln, Germany` with `language` set to English (`en`) might return a feature
         * with the `text` `Cologne` and the `matching_text` `Köln`.
         *
         * Category matches will not appear as `matching_text`. For example, a query for `coffee, Köln` with `language`
         * set to English (`en`) would return a `poi` `Café Reichard`, but this feature will not include a
         * `matching_text` field.
         */
        matching_text?: string;

        /**
         * A string analogous to the `place_name` field that more closely matches the query than results in the
         * specified language. For example, querying `Köln, Germany` with `language` set to English (`en`) might return
         * a feature with the `place_name` `Cologne, Germany` and a `matching_place_name` of
         * `Köln, North Rhine-Westphalia, Germany`.
         *
         * Category matches will not appear in the `matching_place_name` field. For example, a query for `coffee, Köln`
         * with `language` set to English (`en`) would return a `matching_place_name` of
         * `Café Reichard, Unter Fettenhennen 11, Köln, North Rhine-Westphalia 50667, Germany` instead of a
         * `matching_place_name` of `coffee, Unter Fettenhennen 11, Köln, North Rhine-Westphalia 50667, Germany`.
         */
        matching_place_name?: string;

        /**
         * A string of the [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) of the query's primary
         * language.
         *
         * Can be used to identity additional properties on this object in the format `text_{language}`,
         * `place_name_{language}` and `language_{language}`.
         */
        language?: string;

        /**
         * A bounding box array in the form `[minX,minY,maxX,maxY]`.
         */
        bbox: [number, number, number, number];

        /**
         * The coordinates of the feature’s center in the form `[longitude,latitude]`. This may be the literal centroid
         * of the feature’s geometry, or the center of human activity within the feature (for example, the downtown
         * area of a city).
         */
        center: [number, number];

        /**
         * An object describing the spatial geometry of the returned feature.
         */
        geometry: GeocodingFeatureGeometry;

        /**
         * An array representing the hierarchy of encompassing parent features. Each parent feature may include any of
         * the above properties.
         */
        context: GeocodingFeature[];

        /**
         * An object with the routable points for the feature.
         */
        routable_points?: {
            /**
             * An array of points in the form of `[{ coordinates: [lon, lat] }]`, or null if no points were found.
             */
            points: { coordinates: [number, number] }[];
        };
    }

    interface GeocodingFeatureGeometry extends Point {
        /**
         * An array in the format `[longitude,latitude]` at the center of the specified `bbox`.
         */
        coordinates: [number, number];

        /**
         * If present, indicates that an `address` is
         * [interpolated](https://en.wikipedia.org/wiki/Geocoding#Address_interpolation) along a road network. The
         * geocoder can usually return exact address points, but if an address is not present the geocoder can use
         * interpolated data as a fallback. In edge cases, interpolation may not be possible if surrounding address
         * data is not present, in which case the next fallback will be the center point of the street feature itself.
         */
        interpolated?: boolean;

        /**
         * If present, indicates an out-of-parity match. This occurs when an interpolated address is not in the
         * expected range for the indicated side of the street.
         */
        omitted?: boolean;
    }

    /**
     * An object describing the feature. The `properties` object may change with data improvements. Your
     * implementation should check for the presence of these values in a response before it attempts to use them.
     */
    interface GeocodingFeatureProperties {
        /**
         * A point accuracy metric for the returned `address` feature. Can be one of `rooftop`, `parcel`, `point`,
         * `interpolated`, `intersection`, `street`. Note that this list is subject to change.
         */
        accuracy?: 'rooftop' | 'parcel' | 'point' | 'interpolated' | 'intersection' | 'street';

        /**
         * A string of the full street address for the returned `poi` feature. Note that unlike the `address` property
         * for `address` features, this property is inside the `properties` object.
         */
        address?: string;

        /**
         * A string of comma-separated categories for the returned `poi` feature.
         */
        category?: string;

        /**
         * The name of a suggested [Maki](https://www.mapbox.com/maki-icons/) icon to visualize a `poi` feature based
         * on its `category`.
         */
        maki?: string;

        /**
         * Describes whether or not the feature is in the `poi.landmark` data type. This data type is deprecated, and
         * this property will be present on all `poi` features for backwards compatibility reasons but will always be `true`.
         */
        landmark?: boolean;

        /**
         * The [Wikidata](https://wikidata.org/) identifier for the returned feature.
         */
        wikidata?: string;

        /**
         * The [ISO 3166-1](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country and
         * [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) region code for the returned feature.
         */
        short_code: string;
    }
}

declare module '@mapbox/mapbox-sdk/services/isochrone' {
    import { Feature, FeatureCollection, LineString, Polygon } from 'geojson';
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';
    import { RoutingProfile } from '@mapbox/mapbox-sdk/services/directions';

    export default function Isochrone(clientOrConfig: MapiClient | MapiClientConfig): IsochroneService;

    /**
     * Isochrone API service.
     *
     * Learn more about this service and its responses in
     * [the HTTP service documentation](https://docs.mapbox.com/api/navigation/#isochrone).
     */
    interface IsochroneService {
        /**
         * Given a location and a routing profile, retrieve up to four isochrone contours.
         *
         * @param {Object} config
         * @return {MapiRequest<IsochroneResponse>}
         */
        getContours(config: {
            /**
             * A Mapbox Directions routing profile ID. Default: `driving`.
             */
            profile?: Extract<RoutingProfile, 'driving' | 'walking' | 'cycling'>;

            /**
             * A `[longitude,latitude]` coordinate pair around which to center the isochrone lines.
             */
            coordinates: [number, number];

            /**
             * The times in minutes to use for each isochrone contour. You can specify up to four contours.
             * Times must be in increasing order. The maximum time that can be specified is `60` minutes.
             */
            minutes: number[];

            /**
             * The colors to use for each isochrone contour, specified as hex values without a leading `#`
             * (for example, `'ff0000'` for red). If this parameter is used, there must be the same number of
             * `colors` as there are entries in `contours_minutes`. If no `colors` are specified, the Isochrone
             * API will assign a default rainbow color scheme to the output.
             */
            colors?: string[];

            /**
             * Specify whether to return the contours as GeoJSON polygons (`true`) or linestrings (`false`, default).
             * When `polygons=true`, any contour that forms a ring is returned as a polygon.
             */
            polygons?: boolean;

            /**
             * A floating point value from `0.0` to `1.0` that can be used to remove smaller contours. The default is
             * `1.0`. A value of `1.0` will only return the largest contour for a given time value. A value of `0.5`
             * drops any contours that are less than half the area of the largest contour in the set of contours for
             * that same time value.
             */
            denoise?: number;

            /**
             * A positive floating point value in meters used as the tolerance for Douglas-Peucker generalization.
             * There is no upper bound. If no value is specified in the request, the Isochrone API will choose the
             * most optimized generalization to use for the request. Note that the generalization of contours can
             * lead to self-intersections, as well as intersections of adjacent contours.
             */
            generalize?: number;
        }): MapiRequest<IsochroneResponse>;
    }

    /**
     * The response to a Isochrone API request.
     *
     * See the
     * [corresponding documentation](https://docs.mapbox.com/api/navigation/#response-retrieve-isochrones-around-a-location).
     */
    type IsochroneResponse = FeatureCollection<LineString | Polygon, IsochroneFeatureProperties>;

    /**
     * An object that describes how the isochrone should be drawn.
     */
    interface IsochroneFeatureProperties {
        /**
         * The time in minutes used for the isochrone contour.
         */
        contour: number;

        /**
         * The color of the isochrone line if the `geometry` property is `Linestring`.
         */
        color: string;

        /**
         * The opacity of the isochrone line if the `geometry` property is `Linestring`.
         */
        opacity: number;

        /**
         * The fill color of the isochrone polygon if the `geometry` property is `Polygon`, suitable for use in
         * [geojson.io](http://geojson.io/).
         */
        fill: string;

        /**
         * The fill opacity of the isochrone polygon if the `geometry` property is `Polygon`, suitable for use in
         * [geojson.io](http://geojson.io/).
         */
        'fill-opacity': number;

        /**
         * The fill color of the isochrone polygon if the `geometry` property is `Polygon`, suitable for use in
         * [Leaflet](https://leafletjs.com/).
         */
        fillColor: string;

        /**
         * The fill opacity of the isochrone polygon if the `geometry` property is `Polygon`, suitable for use in
         * [Leaflet](https://leafletjs.com/).
         */
        fillOpacity: number;
    }
}

declare module '@mapbox/mapbox-sdk/services/map-matching' {
    import { LngLatLike } from 'mapbox-gl';
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';
    import {
        DirectionsApproach,
        DirectionsProfile,
        DirectionsAnnotation,
        DirectionsGeometry,
        DirectionsOverview,
        Leg,
    } from '@mapbox/mapbox-sdk/services/directions';

    export default function MapMatching(clientOrConfig: MapiClient | MapiClientConfig): MapMatchingService;

    interface MapMatchingService {
        getMatching(request: MapMatchingRequest): MapiRequest;
    }

    interface MapMatchingRequest {
        /**
         * An ordered array of MapMatchingPoints, between 2 and 100 (inclusive).
         */
        points: MapMatchingPoint[];
        /**
         * A directions profile ID. (optional, default driving)
         */
        profile?: DirectionsProfile;
        /**
         * Specify additional metadata that should be returned.
         */
        annotations?: DirectionsAnnotation;
        /**
         * Format of the returned geometry. (optional, default "polyline")
         */
        geometries?: DirectionsGeometry;
        /**
         * Language of returned turn-by-turn text instructions. See supported languages. (optional, default "en")
         */
        language?: string;
        /**
         * Type of returned overview geometry. (optional, default "simplified"
         */
        overview?: DirectionsOverview;
        /**
         * Whether to return steps and turn-by-turn instructions. (optional, default false)
         */
        steps?: boolean;
        /**
         * Whether or not to transparently remove clusters and re-sample traces for improved map matching results. (optional, default false)
         */
        tidy?: boolean;
    }

    interface Point {
        coordinates: LngLatLike;
        /**
         * Used to indicate how requested routes consider from which side of the road to approach a waypoint.
         */
        approach?: DirectionsApproach;
    }

    interface MapMatchingPoint extends Point {
        /**
         * A number in meters indicating the assumed precision of the used tracking device.
         */
        radius?: number;
        /**
         * Whether this coordinate is waypoint or not. The first and last coordinates will always be waypoints.
         */
        isWaypoint?: boolean;
        /**
         * Custom name for the waypoint used for the arrival instruction in banners and voice instructions.
         * Will be ignored unless isWaypoint is true.
         */
        waypointName?: boolean;
        /**
         * Datetime corresponding to the coordinate.
         */
        timestamp?: string | number | Date;
    }

    interface MapMatchingResponse {
        /**
         * An array of Match objects.
         */
        matchings: Matching[];
        /**
         * An array of Tracepoint objects representing the location an input point was matched with.
         * Array of Waypoint objects representing all input points of the trace in the order they were matched.
         * If a trace point is omitted by map matching because it is an outlier, the entry will be null.
         */
        tracepoints: Tracepoint[];
        /**
         * A string depicting the state of the response; see below for options
         */
        code: string;
    }

    interface Tracepoint {
        /**
         * Number of probable alternative matchings for this trace point. A value of zero indicates that this point was matched unambiguously.
         * Split the trace at these points for incremental map matching.
         */
        alternatives_count: number;
        /**
         * Index of the waypoint inside the matched route.
         */
        waypoint_index: number;
        location: number[];
        name: string;
        /**
         * Index to the match object in matchings the sub-trace was matched to.
         */
        matchings_index: number;
    }

    interface Matching {
        /**
         * a number between 0 (low) and 1 (high) indicating level of confidence in the returned match
         */
        confidence: number;
        geometry: string;
        legs: Leg[];
        distance: number;
        duration: number;
        weight_name: string;
        weight: number;
    }
}

declare module '@mapbox/mapbox-sdk/services/matrix' {
    import { Point } from '@mapbox/mapbox-sdk/services/map-matching';
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';
    import { DirectionsProfile, DirectionsAnnotation } from '@mapbox/mapbox-sdk/services/directions';

    export default function Matrix(clientOrConfig: MapiClient | MapiClientConfig): MatrixService;

    interface MatrixService {
        /**
         * Get a duration and/or distance matrix showing travel times and distances between coordinates.
         * @param request
         */
        getMatrix(request: MatrixRequest): MapiRequest;
    }

    interface MatrixRequest {
        points: Point[];
        profile?: DirectionsProfile;
        sources?: number[];
        destinations?: number[];
        annotations?: DirectionsAnnotation;
    }

    interface MatrixResponse {
        code: string;
        durations?: number[][];
        distances?: number[][];
        destinations: Destination[];
        sources: Destination[];
    }

    interface Destination {
        location: number[];
        name: string;
    }
}

declare module '@mapbox/mapbox-sdk/services/optimization' {
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';
    import { MapboxProfile, DirectionsApproach } from '@mapbox/mapbox-sdk/services/directions';

    export default function Optimization(clientOrConfig: MapiClient | MapiClientConfig): OptimizationService;

    interface OptimizationService {
        getContours(config: OptimizationRequest): MapiRequest;
    }

    interface OptimizationRequest {
        /**
         * A Mapbox Directions routing profile ID.
         */
        profile: MapboxProfile;
        /**
         * A semicolon-separated list of {longitude},{latitude} coordinates. There must be between 2 and 12 coordinates. The first coordinate is the start and end point of the trip.
         */
        waypoints: OptimizationWaypoint[];
        /**
         * Return additional metadata along the route. You can include several annotations as a comma-separated list. Possible values are:
         */
        annotations?: 'duration' | 'speed' | 'distance';
        /**
         * Specify the destination coordinate of the returned route. Accepts  any (default) or  last .
         */
        destination?: 'any' | 'last';
        /**
         * Specify pick-up and drop-off locations for a trip by providing a ; delimited list of number pairs that correspond with the coordinates list.
         * The first number of a pair indicates the index to the coordinate of the pick-up location in the coordinates list,
         * and the second number indicates the index to the coordinate of the drop-off location in the coordinates list.
         * Each pair must contain exactly 2 numbers, which cannot be the same.
         * The returned solution will visit pick-up locations before visiting drop-off locations. The first location can only be a pick-up location, not a drop-off location.
         */
        distributions?: number[];
        /**
         * The format of the returned geometry. Allowed values are:  geojson (as LineString ),  polyline (default, a polyline with precision 5),  polyline6 (a polyline with precision 6).
         */
        geometries?: 'geojson' | 'polyline' | 'polyline6';
        /**
         * The language of returned turn-by-turn text instructions. See supported languages . The default is  en (English).
         */
        language?: string;
        /**
         * The type of the returned overview geometry.
         * Can be 'full' (the most detailed geometry available), 'simplified' (default, a simplified version of the full geometry), or 'false' (no overview geometry).
         */
        overview?: 'full' | 'simplified' | 'false';
        /**
         * The coordinate at which to start the returned route. Accepts  any (default) or  first .
         */
        source?: 'any' | 'first';
        /**
         * Whether to return steps and turn-by-turn instructions ( true ) or not ( false , default).
         */
        steps?: boolean;
        /**
         * Indicates whether the returned route is roundtrip, meaning the route returns to the first location ( true , default) or not ( false ).
         * If roundtrip=false , the  source and  destination parameters are required but not all combinations will be possible.
         * See the Fixing Start and End Points section below for additional notes.
         */
        roundtrip?: boolean;
    }

    interface OptimizationWaypoint {
        coordinates: number;
        /**
         * Used to indicate how requested routes consider from which side of the road to approach the waypoint.
         */
        approach?: DirectionsApproach;
        /**
         * Used to filter the road segment the waypoint will be placed on by direction and dictates the angle of approach.
         * This option should always be used in conjunction with a `radius`. The first value is an angle clockwise from true north between 0 and 360,
         * and the second is the range of degrees the angle can deviate by.
         */
        bearing?: number[];
        /**
         * Maximum distance in meters that the coordinate is allowed to move when snapped to a nearby road segment.
         */
        radius?: number | 'unlimited';
    }
}

declare module '@mapbox/mapbox-sdk/services/static' {
    import { Expression, Layer, LngLatLike, LngLatBoundsLike } from 'mapbox-gl';
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';

    export default function StaticMap(clientOrConfig: MapiClient | MapiClientConfig): StaticMapService;

    interface StaticMapService {
        /**
         * Get a static map image..
         * @param request
         */
        getStaticImage(request: StaticMapRequest): MapiRequest;
    }

    interface StaticMapRequest {
        ownerId: string;
        styleId: string;
        width: number;
        height: number;
        position:
        | {
            coordinates: LngLatLike | 'auto';
            zoom: number;
            bearing?: number;
            pitch?: number;
        }
        | 'auto';
        overlays?: CustomMarkerOverlay[] | PathOverlay[] | GeoJsonOverlay[];
        highRes?: boolean;
        before_layer?: string;
        addlayer?: Layer;
        setfilter?: Expression;
        layer_id?: string;
        attribution?: boolean;
        logo?: boolean;
    }

    interface CustomMarkerOverlay {
        marker: CustomMarker;
    }

    interface CustomMarker {
        coordinates: LngLatLike;
        url: string;
    }

    interface PathOverlay {
        /**
         * An array of coordinates describing the path.
         */
        coordinates: LngLatBoundsLike[];
        strokeWidth?: number;
        strokeColor?: string;
        /**
         * Must be paired with strokeColor.
         */
        strokeOpacity?: number;
        /**
         * Must be paired with strokeColor.
         */
        fillColor?: string;
        /**
         * Must be paired with strokeColor.
         */
        fillOpacity?: number;
    }

    interface GeoJsonOverlay {
        geoJson: GeoJSON.GeoJSON;
    }
}

declare module '@mapbox/mapbox-sdk/services/styles' {
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';

    export default function Styles(clientOrConfig: MapiClient | MapiClientConfig): StylesService;

    interface StylesService {
        /**
         * Get a style.
         * @param styleId
         * @param ownerId
         */
        getStyle(config: { styleId: string; ownerId?: string }): MapiRequest;
        /**
         * Create a style.
         * @param style
         * @param ownerId
         */
        createStyle(config: { style: Style; ownerId?: string }): MapiRequest;
        /**
         * Update a style.
         * @param styleId
         * @param style
         * @param lastKnownModification
         * @param ownerId
         */
        // implicit any
        updateStyle(config: {
            styleId: string;
            style: Style;
            lastKnownModification?: string | number | Date;
            ownerId?: string;
        }): void;
        /**
         * Delete a style.
         * @param style
         * @param ownerId
         */
        deleteStyle(config: { style: Style; ownerId?: string }): MapiRequest;
        /**
         * List styles in your account.
         * @param start
         * @param ownerId
         */
        listStyles(config: { start?: string; ownerId?: string }): MapiRequest;
        /**
         * Add an icon to a style, or update an existing one.
         * @param styleId
         * @param iconId
         * @param file
         * @param ownerId
         */
        putStyleIcon(config: {
            styleId: string;
            iconId: string;
            file: Blob | ArrayBuffer | string;
            ownerId?: string;
        }): MapiRequest;
        /**
         * Remove an icon from a style.
         * @param styleId
         * @param iconId
         * @param ownerId
         */
        // implicit any
        deleteStyleIcon(config: { styleId: string; iconId: string; ownerId?: string }): void;
        /**
         * Get a style sprite's image or JSON document.
         * @param styleId
         * @param format
         * @param highRes
         * @param ownerId
         */
        getStyleSprite(config: {
            styleId: string;
            format?: 'json' | 'png';
            highRes?: boolean;
            ownerId?: string;
        }): MapiRequest;
        /**
         * Get a font glyph range.
         * @param fonts
         * @param start
         * @param end
         * @param ownerId
         */
        getFontGlyphRange(config: { fonts: string[]; start: number; end: number; ownerId?: string }): MapiRequest;
        /**
         * Get embeddable HTML displaying a map.
         * @param config
         * @param styleId
         * @param scrollZoom
         * @param title
         * @param ownerId
         */
        getEmbeddableHtml(config: {
            config: any;
            styleId: string;
            scrollZoom?: boolean;
            title?: boolean;
            ownerId?: string;
        }): MapiRequest;
    }

    interface Style {
        version: number;
        name: string;
        /**
         * Information about the style that is used in Mapbox Studio.
         */
        metadata: string;
        sources: any;
        sprite: string;
        glyphs: string;
        layers: string[];
        /**
         * Date and time the style was created.
         */
        created: string;
        /**
         * The ID of the style.
         */
        id: string;
        /**
         * Date and time the style was last modified.
         */
        modified: string;
        /**
         * The username of the style owner.
         */
        owner: string;
        /**
         * Access control for the style, either  public or  private . Private styles require an access token belonging to the owner,
         * while public styles may be requested with an access token belonging to any user.
         */
        visibility: string;
        /**
         * Whether the style is a draft or has been published.
         */
        draft: boolean;
    }
}

declare module '@mapbox/mapbox-sdk/services/tilequery' {
    import { LngLatLike } from 'mapbox-gl';
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';

    export default function TileQuery(clientOrConfig: MapiClient | MapiClientConfig): TileQueryService;

    interface TileQueryService {
        /**
         * Get a static map image..
         * @param request
         */
        listFeatures(request: TileQueryRequest): MapiRequest;
    }

    interface TileQueryRequest {
        /**
         * The maps being queried. If you need to composite multiple layers, provide multiple map IDs.
         */
        mapIds: string[];
        /**
         * The longitude and latitude to be queried.
         */
        coordinates: LngLatLike;
        /**
         * The approximate distance in meters to query for features. (optional, default 0)
         */
        radius: number;
        /**
         * The number of features to return, between 1 and 50. (optional, default 5)
         */
        limit: number;
        /**
         * Whether or not to deduplicate results. (optional, default true)
         */
        dedupe: boolean;
        /**
         * Queries for a specific geometry type.
         */
        geometry: GeometryType;
        layers?: string[];
    }

    type GeometryType = 'polygon' | 'linestring' | 'point';
}

declare module '@mapbox/mapbox-sdk/services/tilesets' {
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';

    export default function Tilesets(clientOrConfig: MapiClient | MapiClientConfig): TilesetsService;

    interface TilesetsService {
        /**
         * List a user's tilesets.
         * @param {ListTilesetsConfig} config
         */
        listTilesets(config: ListTilesetsConfig): MapiRequest;
    }

    interface ListTilesetsConfig {
        /**
         * The username of the account for which to list tilesets.
         */
        ownerId: string;

        /**
         * Filter results by tileset type, either `raster` or `vector`.
         */
        type?: TilesetType;

        /**
         * The maximum number of tilesets to return, from 1 to 500.
         */
        limit?: number;

        /**
         * Sort the listings by their `created` or `modified` timestamps.
         */
        sortBy?: 'created' | 'modified';

        /**
         * The tileset after which to start the listing.
         */
        start?: string;

        /**
         * Filter results by visibility, either `public` or `private`.
         */
        visibility?: TilesetVisibility;
    }

    interface Tileset {
        /**
         * The kind of data contained, either `raster` or `vector`.
         */
        type: TilesetType;

        /**
         * The longitude, latitude, and zoom level for the center of the contained data, given in the
         * format [lon, lat, zoom].
         */
        center: [number, number, number];

        /**
         * A timestamp indicating when the tileset was created.
         */
        created: string;

        /**
         * A human-readable description of the tileset.
         */
        description: string;

        /**
         * The storage in bytes consumed by the tileset.
         */
        filesize: number;

        /**
         * The unique identifier for the tileset.
         */
        id: string;

        /**
         * A timestamp indicating when the tileset was last modified.
         */
        modified: string;

        /**
         * The name of the tileset.
         */
        name: string;

        /**
         * The access control for the tileset, either `public` or `private`.
         */
        visibility: TilesetVisibility;

        /**
         * The processing status of the tileset, one of: `available`, `pending`, or `invalid`.
         */
        status: TilesetStatus;
    }

    type TilesetStatus = 'available' | 'invalid' | 'pending';

    type TilesetType = 'raster' | 'vector';

    type TilesetVisibility = 'private' | 'public';
}

declare module '@mapbox/mapbox-sdk/services/tokens' {
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';

    export default function Tokens(clientOrConfig: MapiClient | MapiClientConfig): TokensService;

    interface TokensService {
        /**
         * List your access tokens.
         */
        listTokens(): MapiRequest;
        /**
         * Create a new access token.
         * @param request
         */
        createToken(request: CreateTokenRequest): MapiRequest;
        /**
         * Create a new temporary access token.
         * @param request
         */
        createTemporaryToken(request: TemporaryTokenRequest): MapiRequest;
        /**
         * Update an access token.
         * @param request
         */
        updateToken(request: UpdateDeleteTokenRequest): MapiRequest;
        /**
         * Get data about the client's access token.
         */
        getToken(): MapiRequest;
        /**
         * Delete an access token.
         * @param request
         */
        deleteToken(request: UpdateDeleteTokenRequest): MapiRequest;
        /**
         * List your available scopes. Each item is a metadata object about the scope, not just the string scope.
         */
        listScopes(): MapiRequest;
    }

    interface Token {
        /**
         * the identifier for the token
         */
        id: string;
        /**
         * the type of token
         */
        usage: string;
        /**
         * the client for the token, always 'api'
         */
        client: string;
        /**
         * if the token is a default token
         */
        default: boolean;
        /**
         * human friendly description of the token
         */
        note: string;
        /**
         * array of scopes granted to the token
         */
        scopes: string[];
        /**
         * date and time the token was created
         */
        created: string;
        /**
         * date and time the token was last modified
         */
        modified: string;
        /**
         * the token itself
         */
        token: string;
    }

    interface CreateTokenRequest {
        note?: string;
        scopes?: string[];
        resources?: string[];
        allowedUrls?: string[];
    }

    interface TemporaryTokenRequest {
        expires: string;
        scopes: string[];
    }

    interface UpdateDeleteTokenRequest extends CreateTokenRequest {
        tokenId: string;
    }

    interface TokenDetail {
        code: string;
        token: Token;
    }

    interface Scope {
        id: string;
        public: boolean;
        description: string;
    }
}

declare module '@mapbox/mapbox-sdk/services/uploads' {
    import { MapiClient, MapiClientConfig, MapiRequest } from '@mapbox/mapbox-sdk';

    export default function Uploads(clientOrConfig: MapiClient | MapiClientConfig): UploadsService;

    interface UploadsService {
        /**
         * List the statuses of all recent uploads.
         * @param config
         */
        listUploads(config: { reverse?: boolean }): MapiRequest;
        /**
         * Create S3 credentials.
         */
        createUploadCredentials(): MapiRequest;
        /**
         * Create an upload.
         * @param config
         */
        createUpload(config: { mapId: string; url: string; tilesetName?: string }): MapiRequest;
        /**
         * Get an upload's status.
         * @param config
         */
        // implicit any
        getUpload(config: { uploadId: string }): any;
        /**
         * Delete an upload.
         * @param config
         */
        // implicit any
        deleteUpload(config: { uploadId: string }): any;
    }

    interface S3Credentials {
        accessKeyId: string;
        bucket: string;
        key: string;
        secretAccessKey: string;
        sessionToken: string;
        url: string;
    }

    interface UploadResponse {
        complete: boolean;
        tileset: string;
        error?: any;
        id: string;
        name: string;
        modified: string;
        created: string;
        owner: string;
        progress: number;
    }
}
