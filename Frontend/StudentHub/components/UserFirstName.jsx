import { useEffect, useState } from "react";
import { Text } from "react-native";

const BACKEND_URL = "http://192.168.178.179:8000";

export default function UserFirstName({ style }) {
  const [firstName, setFirstName] = useState("...");

  useEffect(() => {
    async function fetchName() {
      try {
        // Eerst token ophalen
        const response = await fetch(`${BACKEND_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "jasper.wesseling@student.nhlstenden.com",
            password: "wesselingjasper",
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.token) throw new Error("Login mislukt");
        const token = data.token;

        // Daarna naam ophalen met token
        const res = await fetch(`${BACKEND_URL}/api/users/get`, {
          headers: {
            Authorization: "Bearer " + token,
          },
        });
        const userData = await res.json();
        if (userData.full_name) {
          setFirstName(userData.full_name.trim().split(" ")[0]);
        } else {
          setFirstName("Gebruiker");
        }
      } catch (e) {
        setFirstName("Gebruiker");
      }
    }
    fetchName();
  }, []);

  return <Text style={style}>{firstName}</Text>;
}