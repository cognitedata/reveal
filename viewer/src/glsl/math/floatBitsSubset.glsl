const int MAX_ITER = 24;

float floatBitsSubset(float inNumber, int fromLeastSignificantBitIndex,  int toMostSignificantBitIndex) {
    float lsbif = float(fromLeastSignificantBitIndex);
    float msbif = float(toMostSignificantBitIndex);

    int a = int(toMostSignificantBitIndex - fromLeastSignificantBitIndex);

    float denominator = pow(2.0, lsbif);
    
    float outNumber = 0.0;
    for(int i = 0; i < MAX_ITER; i++)
    {
      if(i >= a) break;

      float backBits = pow(2.0, lsbif + float(i));
      outNumber += (mod(inNumber, backBits * 2.0) - mod(inNumber, backBits)) / denominator;
    }

    return outNumber;
}

#pragma glslify: export(floatBitsSubset)