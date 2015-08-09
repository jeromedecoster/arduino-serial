void setup() {
  Serial.begin(9600);
  Serial.setTimeout(10);
  delay(50);
  Serial.println("setup");
}

void loop() {
  delay(50);
  Serial.println("loop");
  if (Serial.available()) {
    delay(30);
    String str = Serial.readString();
    if (str == "ping") {
      Serial.println("sketch:ping");
    }
  }
}
