int count = 0;

void setup() {
  Serial.begin(9600);
  Serial.setTimeout(10);
  delay(50);
  Serial.println("setup");
}

void loop() {
  delay(50);
  Serial.print("loop ");
  Serial.println(++count);
  if (Serial.available()) {
    delay(30);
    String str = Serial.readString();
    if (str == "sketch") {
      Serial.println("sketch:good");
    }
  }
}
