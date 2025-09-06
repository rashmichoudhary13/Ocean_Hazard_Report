import { Link } from 'expo-router'
import { Text, View } from 'react-native'

export default function Auth() {
  return (
    <View>
      <Text>Auth (login and register) </Text>
      <Link href={"/login"}> Login </Link>
    </View>
  )
}