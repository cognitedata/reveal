const int MAX_ITER = 24;

float floatBitsSubset(float inNumber, int fromLeastSignificantBitIndex,  int toMostSignificantBitIndex) {
    float lsbif = float(fromLeastSignificantBitIndex);
    float msbif = float(toMostSignificantBitIndex);

    int a = int(toMostSignificantBitIndex - fromLeastSignificantBitIndex);
    
    float outNumber = 0.0;
    for(int i = 0; i < MAX_ITER; i++)
    {
      if(i >= a) break;
      outNumber += (mod(inNumber, pow(2.0, lsbif + 1.0 + float(i)))- mod(inNumber, pow(2.0, lsbif + float(i)))) / pow(2.0, lsbif);
    }

    return outNumber;
}

#pragma glslify: export(floatBitsSubset)