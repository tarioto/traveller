import React, { PropTypes } from 'react'
import { View, ScrollView, Switch, Picker, Text, TouchableOpacity, Image } from 'react-native'
import { connect } from 'react-redux'
import LoginActions, { isLoggedIn } from '../Redux/LoginRedux'
import TemperatureActions from '../Redux/TemperatureRedux'
import MapActions from '../Redux/MapRedux'
import { Actions as NavigationActions } from 'react-native-router-flux'
import { Colors, Images, Metrics } from '../Themes'
import RoundedButton from '../Components/RoundedButton'
import FullButton from '../Components/FullButton'
import MapButtonGroup from '../Components/MapButtonGroup'
import { CheckBox, Card, Button, List, ListItem, ButtonGroup } from 'react-native-elements'
import CustomActionSheet from 'react-native-custom-action-sheet'
import SettingsList from 'react-native-settings-list';

import Icon from 'react-native-vector-icons/FontAwesome'

// Styles
import styles from './Styles/SettingsScreenStyle'

class MapStyleScreen extends React.Component {

  render () {
    return (
      <View style={styles.mainContainer}>
        <Image source={Images.background} style={styles.backgroundImage} resizeMode='stretch' />
        <ScrollView style={styles.container}>
          <View style={{flex:1}}>
            <View style={{flex:1}}>
              <SettingsList>
                <SettingsList.Header />
                  <SettingsList.Item title='Normal' />
                  <SettingsList.Item title='Terrain' />
                  <SettingsList.Item title='Satellite' />
              </SettingsList>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    map: state.map,
    mapType: state.mapType
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    // logout: () => dispatch(LoginActions.logout()),
    // requestTemperature: (city) => dispatch(TemperatureActions.temperatureRequest(city)),
    // toggleTraffic: () => dispatch(MapActions.toggleTraffic())
    // toggleMapType: () => dispatch(MapActions.toggleMapType())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapStyleScreen)
