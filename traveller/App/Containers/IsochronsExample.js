import React from 'react'
import { connect } from 'react-redux'
import { View, StyleSheet, Text, Dimensions, StatusBar } from 'react-native'
import MapView from 'react-native-maps'
import Spinner from 'react-native-spinkit'
import { calculateRegion } from '../Lib/MapHelpers'
import MapCallout from '../Components/MapCallout'
import { updateIsochrons, setUpdateIsochronsStateFn, savedPolygons, terminateIsochronWorker,
         isochronFillColor, ISOCHRON_NOT_LOADED, ISOCHRON_LOADING, ISOCHRON_LOADED } from './isochron'

/* ***********************************************************
* IMPORTANT!!! Before you get started, if you are going to support Android,
* PLEASE generate your own API key and add it to android/app/src/main/AndroidManifest.xml
* We've included our API key for demonstration purposes only, and it will be regenerated from
* time to time. As such, neglecting to complete this step could potentially break your app in production!
* https://console.developers.google.com/apis/credentials
* Also, you'll need to enable Google Maps Android API for your project:
* https://console.developers.google.com/apis/api/maps_android_backend/
*************************************************************/

const COORDINATE_PRECISION = 0.001 // degrees
const roundCoordinate = coord => {
  return ( Math.round( Math.abs(coord) / COORDINATE_PRECISION ) * COORDINATE_PRECISION ) * Math.sign(coord)
}
const DATETIME_PRECISION = 60 // seconds
const roundDateTime = dateTime => {
  let date = new Date(dateTime)
  // getTime() gives us milliseconds
  date.setTime( Math.round( date.getTime() / (DATETIME_PRECISION * 1000) ) * (1000 * DATETIME_PRECISION) )
  return date.toISOString()
}

// FIXME: hook this up to current time/location/duration settings (also save those settings somewhere)
const DATETIME = roundDateTime('2016-11-09T18:49:27.000Z')
const DURATIONS = [ 0, 600, 1200, 1800, 2400, 3000, 3600, 4200 ]
const LATITUDE = roundCoordinate(37.7825177)
const LONGITUDE = roundCoordinate(-122.4106772)
const LATITUDE_DELTA = roundCoordinate(0.1)
const DOWNSAMPLING_COORDINATES = 5 // keep 1 point out of every 5

const { width, height } = Dimensions.get('window')
const ASPECT_RATIO = width / height
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
const mapProvider = MapView.PROVIDER_GOOGLE

// start loading isochrons on load
let skipIsochrons = false // set to true to disable loading isochrons [for debug]
updateIsochrons({ params: {
  latitude: LATITUDE,
  longitude: LONGITUDE,
  durations: DURATIONS,
  dateTime: DATETIME,
  downSamplingCoordinates: DOWNSAMPLING_COORDINATES,
  skip: skipIsochrons,
}})

class MapviewExample extends React.Component {
  /* ***********************************************************
  * This example is only intended to get you started with the basics.
  * There are TONS of options available from traffic to buildings to indoors to compass and more!
  * For full documentation, see https://github.com/lelandrichardson/react-native-maps
  *************************************************************/

  constructor (props) {
    super(props)
    /* ***********************************************************
    * STEP 1
    * Set the array of locations to be displayed on your map. You'll need to define at least
    * a latitude and longitude as well as any additional information you wish to display.
    *************************************************************/
    const locations = [
      { title: 'Hack Reactor', latitude: 37.783697, longitude: -122.408966 },
    ]
    /* ***********************************************************
    * STEP 2
    * Set your initial region either by dynamically calculating from a list of locations (as below)
    * or as a fixed point, eg: { latitude: 123, longitude: 123, latitudeDelta: 0.1, longitudeDelta: 0.1}
    *************************************************************/
    const region = calculateRegion(locations, { latPadding: 0.05, longPadding: 0.05 })
    this.state = {
      region: { // Daniel - default region state
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      locations,
      showUserLocation: true,
      zoom: 11,
      isochronDurations: DURATIONS,
      polygonsState: ISOCHRON_NOT_LOADED,
      dateTime: DATETIME,
      downSamplingCoordinates: DOWNSAMPLING_COORDINATES,
      networkActivityIndicatorVisible: false,
      spinnerVisible: true
    }
    this.renderMapMarkers = this.renderMapMarkers.bind(this)
    this.onRegionChange = this.onRegionChange.bind(this)
  }

  componentDidMount () {
    //console.tron.display({ name: 'componentDidMount', value: 'mounted' })
    setUpdateIsochronsStateFn(this.updatePolygonsState.bind(this))

    // delay to give time for the UI to render the map
    this.setState({ networkActivityIndicatorVisible: true, spinnerVisible: true })
    setTimeout(() => this.updatePolygons({
      isochrons: {
        latitude: this.state.region.latitude,
        longitude: this.state.region.longitude,
        durations: this.state.isochronDurations,
        dateTime: this.state.dateTime,
        downSamplingCoordinates: this.state.downSamplingCoordinates,
        skip: skipIsochrons
      }
    }), 500)
  }
  componentWillUnmount () {
    //console.tron.display({ name: 'componentWillUnmount', value: 'about to unmount' })
    setUpdateIsochronsStateFn(null)
    terminateIsochronWorker()
  }

  updatePolygons (params) {
    updateIsochrons({ params: params.isochrons })
  }

  updatePolygonsState (state) {
    //console.tron.display({ name: 'updatePolygonsState', value: state })
    this.setState({ polygonsState: state })
    this.setState({ networkActivityIndicatorVisible: (state === ISOCHRON_LOADED) ? false : true })
    let context = this
    if (state === ISOCHRON_LOADED) {
      // delay the removal of the spinner overlay to give time for the isochrons to appear
      setTimeout(() => { context.setState({ spinnerVisible: false }) }, 150)
    } else {
      this.setState({ spinnerVisible: true })
    }
  }

  componentWillReceiveProps (newProps) {
    /* ***********************************************************
    * STEP 3
    * If you wish to recenter the map on new locations any time the
    * Redux props change, do something like this:
    *************************************************************/
    // this.setState({
    //   region: calculateRegion(newProps.locations, { latPadding: 0.1, longPadding: 0.1 })
    // })
  }

  onRegionChange (region) {
    /* ***********************************************************
    * STEP 4
    * If you wish to fetch new locations when the user changes the
    * currently visible region, do something like this:
    *************************************************************/
    // const searchRegion = {
    //   ne_lat: newRegion.latitude + newRegion.latitudeDelta,
    //   ne_long: newRegion.longitude + newRegion.longitudeDelta,
    //   sw_lat: newRegion.latitude - newRegion.latitudeDelta,
    //   sw_long: newRegion.longitude - newRegion.longitudeDelta
    // }
    // Fetch new data...
    //

    // Daniel - when map dragged update region state
    this.setState({ region })
  }

  calloutPress (location) {
    /* ***********************************************************
    * STEP 5
    * Configure what will happen (if anything) when the user
    * presses your callout.
    *************************************************************/
    console.tron.log(location)
  }

  renderMapMarkers (location) {
    /* ***********************************************************
    * STEP 6
    * Customize the appearance and location of the map marker.
    * Customize the callout in ../Components/MapCallout.js
    *************************************************************/

    return (
      <MapView.Marker key={location.title} coordinate={{latitude: location.latitude, longitude: location.longitude}}>
        <MapCallout location={location} onPress={this.calloutPress} />
      </MapView.Marker>
    )
  }

  render () {
    // wait for all polygons to be loaded
    const polygonsCount = (savedPolygons && this.state.polygonsState === ISOCHRON_LOADED) ? savedPolygons.length : 0

    return (
      <View style={styles.container}>
        <StatusBar networkActivityIndicatorVisible={this.state.networkActivityIndicatorVisible} />
        <MapView
          ref='map'
          provider={mapProvider}
          style={styles.map}
          initialRegion={this.state.region}
          onRegionChangeComplete={this.onRegionChange}
          showsUserLocation={this.state.showUserLocation}
        >
          {this.state.locations.map(location => this.renderMapMarkers(location))}
          { polygonsCount === 0 ? undefined : savedPolygons.map((pArray, arrayIndex) => {
              return (pArray.length === 0) ? undefined : pArray.map((p, index) => {
                return (
                  <MapView.Polygon
                    coordinates={ p.polygon }
                    holes={ p.holes }
                    fillColor={ isochronFillColor(arrayIndex, 0.15) }
                    strokeWidth={ 1 }
                    strokeColor={ 'rgba(85, 85, 85, 0.5)' }
                    key={ arrayIndex * 1000 + index }
                  />
                )
              })
            })
          }
        </MapView>
        <View style={[styles.bubble, styles.latlng]} key={1}>
          <Text style={{ textAlign: 'center' }}>
            {this.state.region.latitude.toPrecision(7)},
            {this.state.region.longitude.toPrecision(7)}
          </Text>
        </View>
        { this.state.spinnerVisible && (
            <View style={styles.spinnerContainer} key={2}>
              <Spinner style={styles.spinner} size={75} type={'Circle'} color={'#ffffff'} />
              <Text style={styles.spinnerText}>Loading isochrones...</Text>
            </View>
          )
        }
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    // ...redux state to props here
  }
}

// Daniel - Styles for the long/lat bubble, etc.
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    // For Android :/
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  spinnerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  spinner: {
    opacity: 0.75,
    marginVertical: 40,
  },
  spinnerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
  }
})

export default connect(mapStateToProps)(MapviewExample)
