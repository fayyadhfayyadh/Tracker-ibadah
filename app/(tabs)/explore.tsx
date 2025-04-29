import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import tw from 'twrnc'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Picker } from '@react-native-picker/picker'

const Index = () => {
  // State
  const [ibadahList, setIbadahList] = useState([]);
  const [ibadahTitle, setIbadahTitle] = useState('');
  const [ibadahDate, setIbadahDate] = useState('');
  const [ibadahCategory, setIbadahCategory] = useState('Wajib');
  const [selectedIbadahFilter, setSelectedIbadahFilter] = useState('Semua');
  const [isEditingIbadah, setIsEditingIbadah] = useState(false);
  const [editIbadahId, setEditIbadahId] = useState(null);

  // Load data saat buka app
  useEffect(() => {
    loadIbadah();
  }, []);

  // Save data kalau ada perubahan
  useEffect(() => {
    saveIbadah();
  }, [ibadahList]);

  const loadIbadah = async () => {
    const saved = await AsyncStorage.getItem('ibadah');
    if (saved) setIbadahList(JSON.parse(saved));
  };

  const saveIbadah = async () => {
    await AsyncStorage.setItem('ibadah', JSON.stringify(ibadahList));
  };

  const isIbadahFormValid = ibadahTitle.trim().length >= 3 && ibadahDate.trim() !== '';

  const addIbadah = () => {
    if (!isIbadahFormValid) {
      Alert.alert('Oops', 'Lengkapi dulu formnya!');
      return;
    }

    const newIbadah = {
      id: Date.now().toString(),
      title: ibadahTitle,
      date: ibadahDate,
      category: ibadahCategory,
      selected: false,
    };

    setIbadahList([...ibadahList, newIbadah]);
    resetIbadahForm();
    Alert.alert('Sukses!', 'Ibadah berhasil ditambahkan');
  };

  const deleteIbadah = (id: string) => {
    Alert.alert(
      'Konfirmasi',
      'Yakin mau hapus ibadah ini?',
      [
        { text: 'Batal' },
        {
          text: 'Hapus', style: 'destructive',
          onPress: () => {
            setIbadahList(prev => prev.filter(item => item.id !== id));
            Alert.alert('Dihapus', 'Ibadah berhasil dihapus');
          }
        }
      ]
    );
  };

  const startEditIbadah = (item: any) => {
    setIbadahTitle(item.title);
    setIbadahDate(item.date);
    setIbadahCategory(item.category);
    setIsEditingIbadah(true);
    setEditIbadahId(item.id);
  };

  const handleEditIbadah = () => {
    Alert.alert(
      'Konfirmasi',
      'Simpan perubahan?',
      [
        { text: 'Batal' },
        {
          text: 'Simpan',
          onPress: () => {
            const updated = ibadahList.map(item =>
              item.id === editIbadahId
                ? { ...item, title: ibadahTitle, date: ibadahDate, category: ibadahCategory }
                : item
            );
            setIbadahList(updated);
            resetIbadahForm();
            Alert.alert('Sukses', 'Perubahan berhasil disimpan');
          }
        }
      ]
    );
  };

  const resetIbadahForm = () => {
    setIbadahTitle('');
    setIbadahDate('');
    setIbadahCategory('Wajib');
    setIsEditingIbadah(false);
    setEditIbadahId(null);
  };

  const toggleSelectIbadah = (id: string) => {
    const updatedList = ibadahList.map(item =>
      item.id === id ? { ...item, selected: !item.selected } : item
    );
    setIbadahList(updatedList);
  };

  const filteredIbadah = selectedIbadahFilter === 'Semua'
    ? ibadahList
    : ibadahList.filter(item => item.category === selectedIbadahFilter);

  const IbadahCard = ({ item }) => (
    <View style={tw`flex-row items-center bg-white rounded-xl p-4 mb-4 mx-5 shadow-md`}>
      <TouchableOpacity onPress={() => toggleSelectIbadah(item.id)} style={tw`mr-4`}>
        <View style={tw`w-6 h-6 rounded items-center justify-center ${item.selected ? 'bg-green-700' : 'bg-white border border-gray-400'}`}>
          {item.selected && <Text style={tw`text-white text-sm`}>✓</Text>}
        </View>
      </TouchableOpacity>

      
      <View style={tw`flex-1`}>
        <Text style={tw`font-bold text-gray-800`}>{item.title}</Text>
        <Text style={tw`text-gray-500 text-xs`}>Kategori: {item.category}</Text>
        <Text style={tw`text-red-700 font-semibold text-xs mt-1`}>{item.date}</Text>
      </View>

    
      <View style={tw`flex-row items-center`}>
        <TouchableOpacity onPress={() => startEditIbadah(item)} style={tw`mr-2`}>
          <View style={tw`w-8 h-8 bg-blue-900 rounded items-center justify-center`}>
            <Text style={tw`text-white text-sm`}>✎</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteIbadah(item.id)}>
          <View style={tw`w-8 h-8 bg-red-800 rounded items-center justify-center`}>
            <Text style={tw`text-white text-sm`}>🗑️</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-200`}>
      <View style={tw`px-5 mt-10`}>
        <Text style={tw`text-lg font-bold text-gray-800 mb-3`}>Form Ibadah</Text>

        <TextInput
          placeholder="Judul Ibadah"
          value={ibadahTitle}
          onChangeText={setIbadahTitle}
          style={tw`border border-[#2A4D50] rounded-full px-5 py-4 mb-3 bg-white text-gray-500`}
        />

        <TextInput
          placeholder="Tanggal Ibadah (YYYY-MM-DD)"
          value={ibadahDate}
          onChangeText={setIbadahDate}
          style={tw`border border-[#2A4D50] rounded-full px-5 py-4 mb-3 bg-white text-gray-500`}
        />

        <Picker
          selectedValue={ibadahCategory}
          onValueChange={(value) => setIbadahCategory(value)}
          style={tw`border border-[#2A4D50] rounded-full mb-3 h-12 px-4 text-gray-500`}
        >
          <Picker.Item label="Wajib" value="Wajib" />
          <Picker.Item label="Sunnah" value="Sunnah" />
        </Picker>

        <TouchableOpacity
          onPress={isEditingIbadah ? handleEditIbadah : addIbadah}
          disabled={!isIbadahFormValid}
          style={tw`bg-[#2A4D50] py-3 rounded-xl ${!isIbadahFormValid ? 'opacity-50' : ''}`}
        >
          <Text style={tw`text-center text-white font-bold`}>
            {isEditingIbadah ? 'Simpan Perubahan' : 'Tambah Ibadah'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter */}
      <View style={tw`flex-row justify-center mt-5`}>
        <TouchableOpacity onPress={() => setSelectedIbadahFilter('Semua')} style={tw`mx-2`}>
          <Text style={tw`${selectedIbadahFilter === 'Semua' ? 'text-green-700 font-bold' : 'text-gray-500'}`}>Semua</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedIbadahFilter('Wajib')} style={tw`mx-2`}>
          <Text style={tw`${selectedIbadahFilter === 'Wajib' ? 'text-green-700 font-bold' : 'text-gray-500'}`}>Wajib</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedIbadahFilter('Sunnah')} style={tw`mx-2`}>
          <Text style={tw`${selectedIbadahFilter === 'Sunnah' ? 'text-green-700 font-bold' : 'text-gray-500'}`}>Sunnah</Text>
        </TouchableOpacity>
      </View>

     
      <FlatList
        data={filteredIbadah}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <IbadahCard item={item} />}
        contentContainerStyle={tw`pt-5 pb-10`}
        ListEmptyComponent={() => (
          <View style={tw`items-center justify-center mt-10`}>
            <Text style={tw`text-gray-500 text-lg font-semibold`}>Belum ada ibadah</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

export default Index
