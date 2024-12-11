import {Text, View, Image} from 'react-native';
import {styles} from './Style';
import Headerscreen from '../component/Headerscreen';
import LinearGradient from 'react-native-linear-gradient';

const LeaderBoarduserDetails = ({navigation, route}) => {
  const {userId, userName, profilePic, totalDays, trips, country} =
    route.params || {};

  // Check if userId is undefined or not a number, and default it to 0
  const safeUserId = typeof userId === 'number' ? userId : 0;

  return (
    <LinearGradient colors={['#ADD8E6', '#0288D1']} style={styles.container}>
      {/* Header */}
      <Headerscreen
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <View style={{marginTop: 60, alignItems: 'center'}}>
        <View>
          <Image
            source={{uri: profilePic}}
            style={{width: 70, height: 70, borderRadius: 100}}
          />
          <View
            style={{
              position: 'absolute',
              bottom: -10,
              left: 20,
              zIndex: 99,
              width: 30,
              height: 30,
              backgroundColor: '#0288D1',
              borderRadius: '100%',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#ffff',
                textAlign: 'center',
              }}>
              {safeUserId + 1}
            </Text>
          </View>
        </View>

        <Text
          style={{
            color: '#fff',
            fontSize: 20,
            fontWeight: '600',
            textAlign: 'center',
            marginTop: 10,
          }}>
          {userName || 'Anonymous'}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 20,
            paddingHorizontal: 20,
          }}>
          <View style={{marginTop: 20}}>
            <Text
              style={{
                textAlign: 'center',
                marginBottom: 8,
                color: '#ffff',
                fontSize: 20,
                fontWeight: '600',
              }}>
              Days
            </Text>
            <View style={styles.daysWrapper}>
              <Text style={styles.daystext}>{totalDays || 0}</Text>
            </View>
          </View>
          <View style={{marginTop: 20}}>
            <Text
              style={{
                textAlign: 'center',
                marginBottom: 8,
                color: '#ffff',
                fontSize: 20,
                fontWeight: '600',
              }}>
              Trips
            </Text>
            <View style={styles.daysWrapper}>
              <Text style={styles.daystext}>{trips || 0}</Text>
            </View>
          </View>
          <View style={{marginTop: 20}}>
            <Text
              style={{
                textAlign: 'center',
                marginBottom: 8,
                color: '#ffff',
                fontSize: 20,
                fontWeight: '600',
              }}>
              Country
            </Text>
            <View style={styles.daysWrapper}>
              <Text style={styles.daystext}>{country || 0}</Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

export default LeaderBoarduserDetails;
