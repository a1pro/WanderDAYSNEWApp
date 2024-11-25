import { Dimensions, StyleSheet } from "react-native";


const screenheight=Dimensions.get('screen').height
const screenwidth=Dimensions.get('screen').width
export const styles = StyleSheet.create({

    container:{
  height:screenheight,
  width:screenwidth,
  paddingVertical:20
//   marginTop:20
    },
    view1 :{
        marginTop:"8%",
        paddingLeft:20,
    
    },
    txt:{
        color:"#ffff",
        fontSize:18,
        fontWeight:'400',
        marginBottom:5
    },
    country:{
        fontSize:16,
        fontWeight:'bold',
        color: '#000',
    },
    trip: {
        fontSize: 14,
        marginVertical: 3,
        fontWeight:'800',
        color:'#ffff'
      },
    inpt:{
        width:"90%",
        alignSelf:"center",
        paddingLeft:20,
        backgroundColor:"#ffff",
        color:'#000',
        padding:15,
        marginTop:10,
        borderRadius:10,
        marginBottom:10
    },
    btnview:{
        width:"50%",
        borderRadius:15,
        alignSelf:"center",
        backgroundColor:"#0288D1",
        padding:12,
        marginTop:15
    },
    img:{
        height:30,
        width:35,
        resizeMode:"contain"
    },
    imgview:{
        flexDirection:"row",
        justifyContent:"space-around",
        alignItems:"center",
        width:"90%",
        alignSelf:"center",
        borderRadius:10,
        alignContent:"center",
        backgroundColor:"#ffff",
        padding:10,
        marginTop:20
        
    },
    header:{
        fontSize:22,
        fontWeight:'800',
        color:"#1D2B64",
        alignSelf:"center",
        marginBottom:20
    },
    view2:{
        flexDirection:"row",
        justifyContent:"space-around",
        alignItems:"center",
        marginTop:20,
        marginBottom:20
    },
    photolist:{
        flexDirection:'row',
        justifyContent:"space-between",
        alignItems:"center",
        margin:10,
      
    },
    btnback:{
        flexDirection:"row",
        justifyContent:"center",
        alignItems:"center",
        alignSelf:"center",
        marginTop:"20%",marginBottom:20
    },
    btnview2:{
        flexDirection:"row",
        justifyContent:"space-around",
        width:"80%",
        alignItems:"center",
        alignSelf:"center",
        marginTop:"10%"
    },
    backText: {
        color: '#fff',
        marginTop: "15%",
        fontSize: 14,
        textAlign:"center",
        
      },
      paswrdview:{ 
        flexDirection: 'row',
         justifyContent:"space-between",
         alignItems: 'center',
          marginBottom: 10,
          width:"90%",
          alignSelf:"center",
          backgroundColor:'#ffff',
          padding:5,
          borderRadius:10 
        }

})
