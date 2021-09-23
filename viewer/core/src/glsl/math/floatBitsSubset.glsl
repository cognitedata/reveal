float floatBitsSubset(float inNumber, int fromLeastSignificantBitIndex,  int toMostSignificantBitIndex) {
    float r = float(fromLeastSignificantBitIndex);
    float l = float(toMostSignificantBitIndex);

    float bitShift = pow(2.0, r);
    return mod(((inNumber - mod(inNumber, bitShift)) / bitShift), pow(2.0, l - r));
}

#pragma glslify: export(floatBitsSubset)