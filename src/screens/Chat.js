import React from 'react';
import { SafeAreaView, View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Headerscreen from '../component/Headerscreen'; // Assuming you have a custom Header component

const Chat = () => {
  const navigation = useNavigation();

  // Sample chat data
  const chatList = [
    {
      id: '1',
      profilePic: require('../assets/User.png'), // Replace with actual image URL
      userName: 'John Doe',
      lastMessage: 'Hey! How are you?',
      time: '10:30 AM',
    },
    {
      id: '2',
      profilePic: require('../assets/Ellipse.png'), // Replace with actual image URL
      userName: 'Jane Smith',
      lastMessage: 'Are we still meeting later?',
      time: '9:45 AM',
    },
    {
      id: '3',
      profilePic: require('../assets/User.png'), // Replace with actual image URL
      userName: 'Alice Brown',
      lastMessage: 'I’ll call you in 5 minutes.',
      time: 'Yesterday',
    },
    // Add more users as needed
  ];

  // Render each chat item
  const renderChatItem = ({ item }) => {
    return (
      <View style={styles.chatItem}>
        <Image source={ item.profilePic } style={styles.profilePic} />
        <View style={styles.chatDetails}>
          <Text style={styles.userName}>{item.userName}</Text>
          <Text style={styles.lastMessage}>{item.lastMessage}</Text>
         
        </View>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginTop: 20 }}>
        <Headerscreen /> {/* Custom Header */}
      </View>

      <FlatList
        data={chatList}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{marginTop:40}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chatDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#555',
  },
  time: {
    fontSize: 12,
    color: '#aaa',
  },
});

export default Chat;
