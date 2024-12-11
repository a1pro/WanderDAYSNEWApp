import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, Image, Alert, TouchableOpacity} from 'react-native';
import Headerscreen from '../component/Headerscreen';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import {Base_URL} from '../component/BaseUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LeaderBoard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const navigation = useNavigation();

  // LeaderBoard API
  const LeaderboardApi = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return Alert.alert('Error', 'Token is missing');
      }
      const res = await axios({
        method: 'get',
        url: `${Base_URL}/leaderboard`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success === true) {
        console.log('LeaderBoard', res.data.message);
        console.log("Leader",res.data.data)
        // Sort the leaderboard data by total_day_spend in descending order
        const sortedLeaderboard = res.data.data.sort(
          (a, b) => b.total_day_spend - a.total_day_spend,
        );
        setLeaderboard(sortedLeaderboard);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    LeaderboardApi();
  }, []);

  // Render leaderboard item
  const renderItem = ({item, index}) => {
    const isTopThree = index < 3;
    const userName = item.full_name || 'Anonymous';
    const userTotalDays = item.total_day_spend || 0;

    return (
      <TouchableOpacity onPress={() => navigation.navigate('LeaderBoardUserDetails', {
        userId: index,      
        userName: userName,     
        profilePic: item.profile_pic, 
        totalDays: userTotalDays,
        trips:item.number_of_trips,
        country:item.number_of_country
      })}>
        <View style={[styles.row, isTopThree && styles.highlightRow]}>
        <View style={styles.rankContainer}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
        <View style={styles.avatarContainer}>
          <Image source={{uri: item.profile_pic}} style={styles.avatar} />
        </View>
        <Text style={styles.nameText}>{userName}</Text>
        <Text style={styles.daysText}>Total Days: {userTotalDays}</Text>
      </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Headerscreen
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Top 3 Section */}
      <View style={styles.topThreeContainer}>
        {leaderboard.slice(0, 3).map((item, index) => {
          const userName = item.full_name || 'Anonymous';
          const userTotalDays = item.total_day_spend || 0;

          return (
            <View key={item.user_id} style={styles.topThreeItem}>
              <View style={{position: 'relative'}}>
                <View
                  style={{
                    position: 'absolute',
                    bottom: -10,
                    left: 15,
                    zIndex: 99,
                    width: 30,
                    height: 30,
                    backgroundColor: '#0288D1',
                    borderRadius: '100%',
                    justifyContent: 'center',
                  }}>
                  <Text style={styles.topThreeRank}>{index + 1}</Text>
                </View>
                <Image
                  source={{uri: item.profile_pic}}
                  style={styles.topThreeAvatar}
                />
              </View>

              <Text style={styles.topThreeName}>{userName}</Text>
              <Text style={styles.topThreeDays}>Days: {userTotalDays}</Text>
            </View>
          );
        })}
      </View>

      {/* Full Leaderboard */}
      <View style={styles.flatlistContainer}>
        <FlatList
          data={leaderboard}
          renderItem={renderItem}
          keyExtractor={item => item.user_id.toString()}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={true}
          ListEmptyComponent={<Text>No data available</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  topThreeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 30,
  },
  topThreeItem: {
    alignItems: 'center',
  },
  topThreeAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  topThreeRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffff',
    textAlign: 'center',
  },
  topThreeName: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  topThreeDays: {
    fontSize: 12,
    color: '#555',
    marginTop: 3,
  },
  listContainer: {
    paddingBottom: 10,
  },
  flatlistContainer: {
    flex: 1,
    backgroundColor: '#0288D14D',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A4B8D',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  highlightRow: {
    backgroundColor: '#0057FF',
  },
  rankContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2A4B8D',
  },
  avatarContainer: {
    marginRight: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  nameText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    flex: 1,
  },
  daysText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});

export default LeaderBoard;
