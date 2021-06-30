import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import PublishingScreen from './screens/WritingPublishingScreen';
import SearchScreen from './screens/SearchScreen';


export default class App extends React.Component {
  render(){
    return (

        <AppContainer />

    );
  }
}

const TabNavigator = createBottomTabNavigator({
  Publishing: {screen: PublishingScreen},
  Search: {screen: SearchScreen},
},
{
  defaultNavigationOptions: ({navigation})=>({
    tabBarIcon: ()=>{
      const routeName = navigation.state.routeName;
      console.log(routeName)
      if(routeName === "Publishing"){
        return(
          <Image
          source={require("./assets/writing.png")}
          style={{width:40, height:40}}
        />
        )

      }
      else if(routeName === "Search"){
        return(
          <Image
          source={require("./assets/searchingwriting.png")}
          style={{width:40, height:40}}
        />)

      }
    }
  })
}
);

const AppContainer =  createAppContainer(TabNavigator);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
