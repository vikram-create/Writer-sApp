import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
  constructor(){
    super();
    this.state = {
      hasCameraPermissions : null,
      scanned : false,
      scannedWritingId : '',
      scannedAuthorId : '',
      buttonState : 'normal',
      transactionMessage : ''
    }
  }

  getCameraPermissions = async (id) =>{
    const {status}  = await Permissions.askAsync(Permissions.CAMERA);

    this.setState({
      /*status === "granted" is true when user has granted permission
        status === "granted" is false when user has not granted the permission
      */
      hasCameraPermissions : status === "granted",
      buttonState : id,
      scanned : false
    })
  }

  handleBarCodeScanned  = async ({type, data})=>{
    const { buttonState} = this.state

    if(buttonState === "WritingId"){
      this.setState({
        scanned : true,
        scannedWritingId : data,
        buttonState : 'normal'
      });
    }
    else if(buttonState === "AuthorId"){
      this.setState({
        scanned : true,
        scannedAuthorId : data,
        buttonState : 'normal'
      })
    }
  }

  initiateWritingIssue = async ()=>{
    //add a transaction
    db.collection("transaction").add({
      'AuthorId' : this.state.scannedAuthorId,
      'WritingId' : this.state.scannedWritingId,
      'data' : firebase.firestore.Timestamp.now().toDate(),
      'transactionType' : "Issue"
    })

    //change Writing status
    db.collection("Writings").doc(this.state.scannedWritingId).update({
      'WritingAvailability' : false
    })
    //change number of issued Writings for Author
    db.collection("Authors").doc(this.state.scannedAuthorId).update({
      'numberOfWritingsIssued' : firebase.firestore.FieldValue.increment(1)
    })

    this.setState({
      scannedAuthorId : '',
      scannedWritingId: ''
    })
  }

  initiateWritingReturn = async ()=>{
    //add a transaction
    db.collection("transactions").add({
      'AuthorId' : this.state.scannedAuthorId,
      'WritingId' : this.state.scannedWritingId,
      'date'   : firebase.firestore.Timestamp.now().toDate(),
      'transactionType' : "Return"
    })

    //change Writing status
    db.collection("Writings").doc(this.state.scannedWritingId).update({
      'WritingAvailability' : true
    })

    //change Writing status
    db.collection("Authors").doc(this.state.scannedAuthorId).update({
      'numberOfWritingsIssued' : firebase.firestore.FieldValue.increment(-1)
    })

    this.setState({
      scannedAuthorId : '',
      scannedWritingId : ''
    })
  }

  handleTransaction = async()=>{
    var transactionMessage = null;
    db.collection("Writings").doc(this.state.scannedWritingId).get()
    .then((doc)=>{
      var Writing = doc.data()
      if(Writing.WritingAvailability){
        this.initiateWritingIssue();
        transactionMessage = "Writing Issued"
      }
      else{
        this.initiateWritingReturn();
        transactionMessage = "Writing Returned"
      }
    })

    this.setState({
      transactionMessage : transactionMessage
    })
  }

  render(){
    const hasCameraPermissions = this.state.hasCameraPermissions;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;

    if(buttonState !== "normal" && hasCameraPermissions){
      return(
        <BarCodeScanner
          onBarCodeScanned = {scanned ? undefined : this.handleBarCodeScanned}
          style = {StyleSheet.absoluteFillObject}
        />
      );
    }

    else if (buttonState === "normal"){
      return(
        <View style={styles.container}>
        <View>
          <Image
            source = {require("../assets/Writinglogo.jpg")}
            style= {{width:200, height:200}}/>
          <Text style={{textAlign:'center', fontSize:30,}}>Wily</Text>
        </View>
        <View style={styles.inputView}>
        <TextInput
          style={styles.inputBox}
          placeholder="Writing Id"
          value={this.state.scannedWritingId}/>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={()=>{
            this.getCameraPermissions("WritingId")
          }}>
          <Text style={styles.buttonText}>Scan</Text>
        </TouchableOpacity>
        </View>

        <View style={styles.inputView}>
        <TextInput
          style={styles.inputBox}
          placeholder="Author Id"
          value={this.state.scannedAuthorId}/>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={()=>{
            this.getCameraPermissions("AuthorId")
          }}>
          <Text style={styles.buttonText}>Scan</Text>
        </TouchableOpacity>
        </View>
        <Text style={styles.transactionAlert}>{this.state.transactionMessage}</Text>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={async()=>{
            var transactionMessage = await this.handleTransaction();
          }}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
      )
    }
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  displayText:{
    fontSize: 15,
    textDecorationLine: 'underline'
  },
  scanButton:{
    backgroundColor: '#2196F3',
    padding: 10,
    margin: 10
  },
  buttonText:{
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10
  },
  inputView:{
    flexDirection: 'row',
    margin: 20
  },
  inputBox:{
    width: 200,
    height: 40,
    borderWidth: 1.5,
    borderRightWidth: 0,
    fontSize: 20
  },
  scanButton:{
    backgroundColor: '#66BB6A',
    width: 50,
    borderWidth: 1.5,
    borderLeftWidth: 0
  },
  submitButton:{
    backgroundColor: '#FBC02D',
    width: 100,
    height:50
  },
  submitButtonText:{
    padding: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight:"bold",
    color: 'white'
  }
});
