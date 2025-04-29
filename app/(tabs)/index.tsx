import { View,Text,TextInput,TouchableOpacity,FlatList,Alert,Image,Switch,} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';
import { Audio } from 'expo-av';

const Index = () => {
  const [Judulibadah, setJudulibadah] = useState('');
  const [waktuibadah, setwaktuibadah] = useState('');
  const [category, setCategory] = useState('Sunnah');
  const [list, setList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedIbadahFilter, setSelectedIbadahFilter] = useState('Semua');
  const [currentTime, setCurrentTime] = useState(moment().format('HH:mm'));
  const [currentPrayer, setCurrentPrayer] = useState('');
  const [sound, setSound] = useState(null);
  const [isAzanEnabled, setIsAzanEnabled] = useState(true);

  const JudulibadahRef = useRef(null);

  useEffect(() => {
    loadTask();
  }, []);

  useEffect(() => {
    saveTask();
  }, [list]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = moment();
      setCurrentTime(now.format('HH:mm'));
      checkPrayerTime(now);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPrayer]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  // Menambahkan efek untuk menghentikan suara ketika fitur Adzan dimatikan
  useEffect(() => {
    if (!isAzanEnabled && sound) {
      sound.stopAsync(); // Menghentikan suara azan jika fitur dimatikan
    }
  }, [isAzanEnabled]);

  const playAzan = async () => {
    if (!isAzanEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/azan1.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log('Gagal memutar adzan:', error);
    }
  };

  const checkPrayerTime = (now) => {
    const hour = now.hour();
    let newPrayer = '';

    if (hour >= 4 && hour < 6) newPrayer = 'Waktu Sholat Subuh';
    else if (hour >= 12 && hour < 15) newPrayer = 'Waktu Sholat Dzuhur';
    else if (hour >= 15 && hour < 18) newPrayer = 'Waktu Sholat Ashar';
    else if (hour >= 18 && hour < 19) newPrayer = 'Waktu Sholat Maghrib';
    else if (hour >= 19 && hour < 20) newPrayer = 'Waktu Sholat Isya';

    if (newPrayer !== '' && newPrayer !== currentPrayer) {
      setCurrentPrayer(newPrayer);
      playAzan();
    } else if (newPrayer === '') {
      setCurrentPrayer('');
    }
  };

  const addTask = () => {
    if (Judulibadah.trim().length < 3) {
      Alert.alert('Huh', 'Ishhh kamu jangan gitu');
      return;
    }

    Alert.alert('Konfirmasi', 'Tambah ibadah ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Oke',
        onPress: () => {
          const newTask = {
            id: Date.now().toString(),
            Judulibadah,
            waktuibadah: waktuibadah || '-',
            category,
            selected: false,
          };
          setList((prevList) => [...prevList, newTask]);
          resetForm();
        },
      },
    ]);
  };

  const loadTask = async () => {
    const saved = await AsyncStorage.getItem('task');
    if (saved) setList(JSON.parse(saved));
  };

  const saveTask = async () => {
    await AsyncStorage.setItem('task', JSON.stringify(list));
  };

  const deleteTask = (id) => {
    Alert.alert('Beneran?', 'Aku hapus nih ya', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          setList((prev) => prev.filter((item) => item.id !== id));
          Alert.alert('Dihapus', 'Tugas berhasil dihapus');
        },
      },
    ]);
  };

  const startEdit = (item) => {
    setJudulibadah(item.Judulibadah);
    setwaktuibadah(item.waktuibadah);
    setCategory(item.category);
    setIsEditing(true);
    setEditId(item.id);
  };

  const handleEdit = () => {
    Alert.alert('Konfirmasi', 'Simpan perubahan?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Oke',
        onPress: () => {
          const updated = list.map((item) =>
            item.id === editId
              ? { ...item, Judulibadah, waktuibadah, category }
              : item
          );
          setList(updated);
          resetForm();
        },
      },
    ]);
  };

  const resetForm = () => {
    setJudulibadah('');
    setwaktuibadah('');
    setCategory('Sunnah');
    setIsEditing(false);
    setEditId(null);
  };

  const toggleSelectTask = (id) => {
    const updatedList = list.map((item) =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    setList(updatedList);
  };

  const TaskCard = ({ item }) => (
    <View style={tw`flex-row items-center bg-white rounded-2xl p-4 mx-5 shadow-sm mt-4`}>
      <TouchableOpacity onPress={() => toggleSelectTask(item.id)} style={tw`mr-4`}>
        <View
          style={tw`w-6 h-6 rounded-full border-2 ${
            item.selected ? 'bg-[#6B4E34] border-[#6B4E34]' : 'border-gray-400'
          } items-center justify-center`}
        >
          {item.selected && <Text style={tw`text-white text-sm`}>✓</Text>}
        </View>
      </TouchableOpacity>

      <View style={tw`flex-1`}>
        <Text style={tw`font-semibold text-gray-700 text-base`}>
          {item.Judulibadah}
        </Text>
        <Text style={tw`text-gray-400 text-xs mt-1`}>Kategori: {item.category}</Text>
        <Text style={tw`text-[#B45309] font-semibold text-xs mt-1`}>
          {item.waktuibadah}
        </Text>
      </View>

      <View style={tw`flex-row items-center`}>
        <TouchableOpacity onPress={() => startEdit(item)} style={tw`mr-2`}>
          <View style={tw`w-8 h-8 bg-[#6B4E34] rounded-full items-center justify-center`}>
            <Text style={tw`text-white text-sm`}>✎</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteTask(item.id)}>
          <View style={tw`w-8 h-8 bg-[#6B4E34] rounded-full items-center justify-center`}>
            <Text style={tw`text-white text-sm`}>🗑️</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-[#FFFAF0]`}>
      <FlatList
        ListHeaderComponent={
          <>
            <View style={tw`flex-row items-center bg-[#D6B99A] mx-5 mt-5 rounded-2xl h-35 shadow overflow-hidden`}>
              <View style={tw`flex-1 px-4`}>
                <Text style={tw`text-10 font-bold text-gray-800`}>{currentTime}</Text>
                {currentPrayer ? (
                  <Text style={tw`text-sm text-gray-700 mt-1`}>{currentPrayer}</Text>
                ) : (
                  <Text style={tw`text-sm text-gray-400 mt-1`}>Belum waktu sholat</Text>
                )}
              </View>
              <Image
                source={require('../../assets/images/masit.png')}
                style={tw`w-50 h-45 mb-2 -mr-3 rounded-2xl`}
                resizeMode="cover"
              />
            </View>

            <View style={tw`flex-row items-center justify-end px-5 -mb-4`}>
              <Text style={tw`text-gray-700 mr-2`}>Suara Adzan</Text>
              <Switch
                value={isAzanEnabled}
                onValueChange={setIsAzanEnabled}
                trackColor={{ false: '#ccc', true: '#6B4E34' }}
                thumbColor="#fff"
              />
            </View>

            <View style={tw`p-5`}>
              <Text style={tw`text-lg font-bold text-gray-700 mb-4`}>
                Tambah jadwal Ibadah
              </Text>

              <TextInput
                placeholder="Judul ibadah"
                value={Judulibadah}
                onChangeText={setJudulibadah}
                style={tw`border border-[#D6B99A] rounded-full px-5 py-4 mb-3 bg-white text-gray-700`}
              />
              <TextInput
                placeholder="Waktu ibadah"
                value={waktuibadah}
                onChangeText={setwaktuibadah}
                style={tw`border border-[#D6B99A] rounded-full px-5 py-4 mb-3 bg-white text-gray-700`}
              />
              <View style={tw`border border-[#D6B99A] rounded-full bg-white mb-3`}>
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value)}
                  style={tw`h-12 px-4 text-gray-700`}
                >
                  <Picker.Item label="Sunnah" value="Sunnah" />
                  <Picker.Item label="Wajib" value="Wajib" />
                </Picker>
              </View>
              <TouchableOpacity
                onPress={isEditing ? handleEdit : addTask}
                disabled={Judulibadah.trim() === ''}
                style={tw`bg-[#6B4E34] py-3 rounded-full ${Judulibadah.trim() === '' ? 'opacity-50' : ''}`}
              >
                <Text style={tw`text-center text-white font-bold`}>
                  {isEditing ? 'Update' : 'Tambah Ibadah'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={tw`flex-row justify-center mt-5`}>
              {['Semua', 'Wajib', 'Sunnah'].map((filter) => {
                const count =
                  filter === 'Semua'
                    ? list.length
                    : list.filter((item) => item.category === filter).length;
                const isSelected = selectedIbadahFilter === filter;

                return (
                  <TouchableOpacity
                    key={filter}
                    onPress={() => setSelectedIbadahFilter(filter)}
                    style={tw`flex-row items-center px-4 py-2 rounded-full mx-1 ${isSelected ? 'bg-[#6B4E34]' : 'bg-gray-200'}`}
                  >
                    <Text style={tw`${isSelected ? 'text-white' : 'text-gray-700'} font-semibold`}>
                      {filter}
                    </Text>
                    <View style={tw`ml-2 bg-white rounded-full px-2 py-0.5`}>
                      <Text style={tw`text-xs ${isSelected ? 'text-[#6B4E34]' : 'text-gray-700'}`}>
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        }
        data={
          selectedIbadahFilter === 'Semua'
            ? list
            : list.filter((item) => item.category === selectedIbadahFilter)
        }
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskCard item={item} />}
        contentContainerStyle={tw`pt-5 pb-10`}
        ListEmptyComponent={() => (
          <View style={tw`items-center justify-center mt-20`}>
            <Text style={tw`text-gray-400 text-lg font-semibold`}>Belum ada ibadah</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default Index;
