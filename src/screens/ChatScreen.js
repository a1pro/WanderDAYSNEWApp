import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { getuserdetail } from '../reduxtoolkit/slice/getuserdetail';
import firestore from '@react-native-firebase/firestore';

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = route.params;
  const dispatch = useDispatch();

  const userDetails = useSelector((state) => state.getuserdetail.userdetailsDetails);
  const loading = useSelector((state) => state.getuserdetail.loading);
  const error = useSelector((state) => state.getuserdetail.error);

  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // State for selected image
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

  const currentUserId = userDetails?.data?.id;
  const receiverId = user?.id;

  const conversationId = [currentUserId, receiverId].sort().join('_');

  useEffect(() => {
    dispatch(getuserdetail());

    if (currentUserId && receiverId) {
      const unsubscribe = firestore()
        .collection('messages')
        .where('conversationId', '==', conversationId)
        .orderBy('timestamp', 'asc')
        .onSnapshot(
          (querySnapshot) => {
            const messages = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setChatMessages(messages);
          },
          (error) => console.error('Error fetching messages:', error)
        );

      return () => unsubscribe();
    }
  }, [dispatch, currentUserId, receiverId]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const message = {
      senderId: currentUserId,
      receiverId,
      message: inputMessage.trim(),
      timestamp: firestore.FieldValue.serverTimestamp(),
      participants: [currentUserId, receiverId],
      conversationId,
    };

    firestore()
      .collection('messages')
      .add(message)
      .then(() => setInputMessage(''))
      .catch((error) => console.error('Error sending message:', error));
  };

  const handleSendImage = async (images) => {
    if (!images || images.length === 0) return;

    const uploadTasks = images.map((image) => {
      const message = {
        senderId: currentUserId,
        receiverId,
        message: '',
        imageUri: image.uri,
        timestamp: firestore.FieldValue.serverTimestamp(),
        participants: [currentUserId, receiverId],
        conversationId,
      };

      return firestore().collection('messages').add(message);
    });

    try {
      await Promise.all(uploadTasks);
    } catch (error) {
      console.error('Error sending image:', error);
    }
  };

  const openCamera = async () => {
    const result = await launchCamera({ mediaType: 'photo' });
    if (result?.assets?.length) {
      handleSendImage(result.assets);
    }
  };

  const openGallery = async () => {
    const result = await launchImageLibrary({ selectionLimit: 4, mediaType: 'photo' });
    if (result?.assets?.length) {
      handleSendImage(result.assets);
    }
  };

  const handleImagePress = (imageUri) => {
    setSelectedImage(imageUri);
    setIsModalVisible(true);
  };

  const renderChatMessage = ({ item }) => (
    <View
      style={[
        styles.chatBubble,
        item.senderId === currentUserId ? styles.senderBubble : styles.receiverBubble,
      ]}
    >
      {item.imageUri ? (
        <TouchableOpacity onPress={() => handleImagePress(item.imageUri)}>
          <Image source={{ uri: item.imageUri }} style={styles.chatImage} />
        </TouchableOpacity>
      ) : (
        <Text style={styles.chatText}>{item.message}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Image source={{ uri: user.profile_pic }} style={styles.userImage} />
        <Text style={styles.userName}>{user.full_name || 'User'}</Text>
        <TouchableOpacity style={styles.menuIcon}>
          <Entypo name="dots-three-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#007AFF" />}
      {/* {error && <Text style={styles.errorText}>Error: {error}</Text>} */}

      <FlatList
        data={chatMessages}
        renderItem={renderChatMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatContent}
      />

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={openCamera}>
          <Ionicons name="camera-outline" size={28} color="black" />
        </TouchableOpacity>
        <View style={styles.inputWithSend}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message"
            value={inputMessage}
            onChangeText={setInputMessage}
          />
          <TouchableOpacity onPress={handleSendMessage}>
            <Ionicons name="send" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={openGallery}>
          <Ionicons name="image-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

     
      <Modal visible={isModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsModalVisible(false)}>
            <Ionicons name="close-circle" size={30} color="white" />
          </TouchableOpacity>
          <Image source={{ uri: selectedImage }} style={styles.modalImage} />
        </View>
      </Modal>
    </View>
  );
};





const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userImage: { width: 40, height: 40, borderRadius: 20, marginLeft: 10 },
  userName: { flex: 1, marginLeft: 10, fontSize: 18, fontWeight: 'bold' },
  menuIcon: { marginLeft: 10 },
  chatArea: { flex: 1 },
  chatContent: { padding: 10 },
  chatBubble: { maxWidth: '75%', padding: 10, borderRadius: 10, marginVertical: 5 },
  senderBubble: { alignSelf: 'flex-end', backgroundColor: '#DCF8C6' },
  receiverBubble: { alignSelf: 'flex-start', backgroundColor: '#f1f0f0' },
  chatText: { fontSize: 16 },
  chatImage: { width: 150, height: 150, borderRadius: 10 },
  inputWithSend: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
  },
  sendButton: { position: 'absolute', right: 10, alignSelf: 'center' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  textInput: { flex: 1, padding: 10, paddingRight: 35, fontSize: 16 },
  loader: { marginTop: 20 },
  errorText: { color: 'red', marginTop: 20, textAlign: 'center' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
});

export default ChatScreen;
