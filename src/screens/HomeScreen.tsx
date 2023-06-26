import { StatusBar, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Keyboard } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Image, BackHandler } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../../theme'

import { CalendarDaysIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { MapPinIcon } from 'react-native-heroicons/solid'
import { debounce } from 'lodash'
import { fetchLocations, fetchWeatherForecast } from '../api/weather'
import * as Progress from 'react-native-progress'
import { getData, storeData } from '../utils/asyncStorage'
import { weatherImages } from '../utils/constants'

export default function HomeScreen() {

    const [showSearch, toggleSearch] = useState(false)
    const [locations, setLocations] = useState<any[]>([])
    const [weather, setWeather]: any = useState({})
    const [loading, setLoading] = useState(true)
    const [isFocus, setIsFocus] = useState(false)

    const handleFocus = () => {
        setIsFocus(true)
    }

    const handleLocations = (loc: any) => {
        // console.log("Locations", loc)
        setLocations([]);
        toggleSearch(false)
        setLoading(true)
        fetchWeatherForecast({
            cityName: loc.name,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLoading(false)
            storeData('city', loc.name)
            setIsFocus(false)
            // console.log('Got forecast ', data)
        })
    }

    const handleSearch = (value: any) => {
        if (value.length > 2) {
            fetchLocations({ cityName: value })
                .then(data => {
                    setLocations(data)
                    setLoading(false)
                })
        }
    }

    function handleBackButtonClick() {
        setIsFocus(false)
        return false;
    }

    useEffect(() => {
        fetchMyWeatherData();
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setIsFocus(false)
            }
        )
        return () => {
            keyboardDidShowListener.remove();
        };
    }, [])

    const fetchMyWeatherData = async () => {

        let myCity = await getData('city');
        let cityName = 'Lagos';
        if (myCity) cityName = myCity;

        fetchWeatherForecast({
            cityName,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLoading(false)
        })
    }

    const handleTextDebounce = useCallback(debounce(handleSearch, 1200), [])

    const { current, location }: any = weather;

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#2D4356" barStyle={'light-content'} />
            <Image
                blurRadius={70}
                style={styles.appBackground}
                source={require('../../assets/images/bg.png')} />

            {
                loading ? (
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                        <Progress.CircleSnail thickness={10} size={150} color='#0bb3b2' />
                    </View>
                ) : (
                    <SafeAreaView style={styles.bodyContainer}>
                        {/*Search box here*/}
                        <View style={[{ height: '7%' }, styles.searchBar]}>
                            <View style={[{ backgroundColor: showSearch ? theme.bgwhite(0.2) : 'transparent' }, styles.searchContainer]}>

                                {
                                    showSearch ? (
                                        <TextInput
                                            onChangeText={handleTextDebounce}
                                            onFocus={handleFocus}
                                            placeholder='Search City'
                                            placeholderTextColor='lightgray'
                                            style={styles.searchInput}
                                        />
                                    ) : null
                                }

                                <TouchableOpacity
                                    onPress={() => toggleSearch(!showSearch)}
                                    style={[{ backgroundColor: theme.bgwhite(0.3) }, styles.searchIcon]}
                                >
                                    <MagnifyingGlassIcon size={23} color={'white'} />
                                </TouchableOpacity>

                            </View>

                            {
                                locations.length > 0 && showSearch ? (
                                    <View style={styles.searchResultDropdownContainer}>
                                        {
                                            locations.map((loc, index) => {
                                                let showBorder = index + 1 != locations.length;
                                                let borderClassWidth = showBorder ? 2 : 0
                                                let borderClassColor = showBorder ? 'rgb(156 163 175)' : ''
                                                return (
                                                    <TouchableOpacity
                                                        onPress={() => handleLocations(loc)}
                                                        key={index}
                                                        style={[{ borderBottomColor: borderClassColor, borderBottomWidth: borderClassWidth }, styles.searchDropdownItems]}
                                                    >
                                                        <MapPinIcon size={20} color={'grey'} />
                                                        <Text style={styles.searchText}>{loc?.name}, {loc?.country}</Text>
                                                    </TouchableOpacity>
                                                )
                                            })
                                        }
                                    </View>
                                ) : null
                            }

                        </View>

                        {/*Forcast Section*/}
                        <View style={styles.forcastContainer}>
                            <Text style={styles.forcastHeading}>
                                {location?.name + ','}&nbsp;
                                <Text style={styles.forcastSubheading}>
                                    {location?.country}
                                </Text>
                            </Text>
                            {/*weather image*/}
                            {
                                isFocus ? null : (

                                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                        <Image
                                            // source={current?.condition?.icon ? { uri: 'https:' + current.condition.icon } : require('../../assets/icons/cloud.png')}
                                            source={weatherImages[current?.condition?.text || 'other']}
                                            style={{ width: 208, height: 208 }}
                                        />
                                    </View>
                                )
                            }
                            {/*degree celcius*/}
                            <View style={{ marginTop: 8 }}>
                                <Text style={{ textAlign: 'center', fontWeight: 'bold', color: 'white', fontSize: 60, marginLeft: 20 }}>{current?.temp_c}&#176;</Text>
                                <Text style={{ textAlign: 'center', color: 'white', fontSize: 20, lineHeight: 28, letterSpacing: 1.6 }}>{current?.condition?.text}</Text>
                            </View>
                            {/*Other status*/}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 12 }}>
                                <View style={{ flexDirection: 'row', marginRight: 8, alignItems: 'center' }}>
                                    <Image source={require('../../assets/icons/wind.png')} style={{ height: 24, width: 24 }} />
                                    <Text style={{ color: 'white', fontSize: 16, lineHeight: 24, fontWeight: '600' }}>
                                        {current?.wind_kph}km
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', marginRight: 8, alignItems: 'center' }}>
                                    <Image source={require('../../assets/icons/drop.png')} style={{ height: 24, width: 24 }} />
                                    <Text style={{ color: 'white', fontSize: 16, lineHeight: 24, fontWeight: '600' }}>
                                        {current?.humidity}%
                                    </Text>
                                </View>
                                <View style={{ flexDirection: 'row', marginRight: 8, alignItems: 'center' }}>
                                    <Image source={require('../../assets/icons/sun.png')} style={{ height: 24, width: 24 }} />
                                    <Text style={{ color: 'white', fontSize: 16, lineHeight: 24, fontWeight: '600' }}>
                                        {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/*Forcast for next days*/}
                        <View style={{ marginBottom: 10, marginTop: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginLeft: 8 }}>
                                <CalendarDaysIcon size={22} color={'white'} />
                                <Text style={{ color: 'white', fontSize: 20, lineHeight: 24, paddingLeft: 10 }}>Daily forcast</Text>
                            </View>

                            <ScrollView
                                horizontal
                                contentContainerStyle={{ paddingHorizontal: 15 }}
                                showsHorizontalScrollIndicator={false}
                            >

                                {
                                    weather?.forecast?.forecastday?.map((item: any, index: any) => {

                                        let date = new Date(item?.date);
                                        let dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                                        dayName = dayName.split(',')[0]

                                        return (

                                            <View key={index} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 96, paddingVertical: 12, marginTop: 4, marginRight: 16, borderRadius: 24, backgroundColor: theme.bgwhite(0.15) }}>
                                                <Image
                                                    source={weatherImages[item?.day?.condition?.text || 'other']}
                                                    style={{ height: 44, width: 44 }}
                                                />
                                                <Text style={{ color: 'white' }}>{dayName}</Text>
                                                <Text style={{ color: 'white', fontSize: 20, lineHeight: 28, fontWeight: '600' }}>{item?.day?.avgtemp_c}&#176;</Text>
                                            </View>
                                        )
                                    })
                                }

                            </ScrollView>

                        </View>
                    </SafeAreaView>
                )
            }
        </View>
    )
}

const styles = StyleSheet.create({
    forcastHeading: {
        color: '#ffffff',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 24,
        lineHeight: 32,
    },
    forcastSubheading: {
        color: 'rgb(156 163 175)',
        fontWeight: '600',
        fontSize: 18,
        lineHeight: 28,
    },
    container: {
        flex: 1,
        position: 'relative'
    },
    appBackground: {
        width: '100%',
        height: '100%',
        position: 'absolute'
    },
    bodyContainer: {
        display: 'flex',
        flex: 1
    },
    searchBar: {
        marginHorizontal: 16,
        position: 'relative',
        zIndex: 50,
    },
    searchContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        borderRadius: 9999,
        flexDirection: 'row'
    },
    searchInput: {
        paddingLeft: 24,
        paddingBottom: 4,
        height: 40,
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        color: '#fff',
        zIndex: 1
    },
    searchIcon: {
        borderRadius: 9999,
        padding: 12,
        margin: 1.5
    },
    searchResultDropdownContainer: {
        position: 'absolute',
        width: '100%',
        backgroundColor: 'rgb(209 213 219)',
        top: 56,
        borderRadius: 24
    },
    searchDropdownItems: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0,
        padding: 12,
        paddingHorizontal: 16,
        marginBottom: 4,
    },
    searchText: {
        color: 'black',
        fontSize: 18,
        lineHeight: 28,
        marginLeft: 8
    },
    forcastContainer: {
        marginHorizontal: 16,
        display: 'flex',
        justifyContent: 'space-around',
        flex: 1,
        marginBottom: 8
    }
})