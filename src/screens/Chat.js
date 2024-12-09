import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Headerscreen from '../component/Headerscreen';
import axios from 'axios';

const { height, width } = Dimensions.get('window'); 

const Chat = () => {
  const navigation = useNavigation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [chatList, setChatList] = useState([]); 
  const [loading, setLoading] = useState(false); 

  
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');

        if (!token) {
          Alert.alert('Error', 'Token not found. Please log in again.');
          return;
        }

        const response = await axios.get(
          'https://visatravel.a1professionals.net/api/v1/app/getusers',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setChatList(response.data.data); 
        } else {
          Alert.alert('Error', response.data.message || 'Failed to fetch users.');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        Alert.alert('Error', 'Something went wrong while fetching users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleProfileImagePress = (image) => {
    setSelectedImage({ uri: image });
    setIsModalVisible(true); 
  };

  const renderChatItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ChatScreen', {
            user: item,
          })
        }
      >
        <View style={styles.chatItem}>
          <TouchableOpacity
            onPress={() => handleProfileImagePress(item.profile_pic)}
          >
            <Image
              source={{ uri: item.profile_pic }}
              style={styles.profilePic}
            />
          </TouchableOpacity>
          <View style={styles.chatDetails}>
            <Text style={styles.userName}>{item.full_name || 'No Name'}</Text>
            
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginTop: 20 }}>
        <Headerscreen />
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={chatList}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ marginTop: 40 ,paddingBottom:80}}
        />
      )}

      <Modal
        visible={isModalVisible}
        transparent={true} 
        animationType="fade" 
        onRequestClose={() => setIsModalVisible(false)} 
      >
        <TouchableOpacity
          style={styles.modalBackground}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Image source={selectedImage} style={styles.modalImage} />
          </View>
        </TouchableOpacity>
      </Modal>
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
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#555',
  },
  // Modal styles
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center', 
  },
  modalImage: {
    width: width,   
    height: height / 2, 
    resizeMode: 'contain',
  },
});

export default Chat;
