import { View, Text } from 'react-native';
import React, { useEffect} from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const Home = () => {
  useEffect(() => {
    const testCall = async () => {
      try {
        const result = await axios.get(`${API_URL}/users`);
        console.log('~ file: Home.tsx:9 ~ testCall ~ result:', result.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    testCall();
  }, []);

  return (
    <View>
      <Text>Home</Text>
    </View>
  )
}

export default Home;