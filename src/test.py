import sys
sys.path.append("C:\Program Files (x86)\IronPython 2.7\Lib")
sys.path.append("C:\Program Files (x86)\IronPython 2.7\DLLs")
from ctypes import *
from ctypes.wintypes import DWORD
import traceback;
from System import Array, Byte

class DATA_BLOB(Structure):
    _fields_ = [("cbData", DWORD), ("pbData", POINTER(c_char))];

def getData(blobOut):
    cbData = int(blobOut.cbData);
    pbData = blobOut.pbData;
    buffer = c_buffer(cbData);
    memcpy(buffer, pbData, cbData);
    LocalFree(pbData);
    return buffer.raw;

def decrypt(cipherText):
    try:
        test = str(buffer(cipherText))
        bufferIn = c_buffer(test, len(cipherText));
        blobIn = DATA_BLOB(len(cipherText), bufferIn);
        blobOut = DATA_BLOB();
        if CryptUnprotectData(byref(blobIn), None, None, None, None,CRYPTPROTECT_UI_FORBIDDEN, byref(blobOut)):
            return getData(blobOut);
        else:
            raise Exception("Failed to decrypt data");

    except TypeError as e:
        print("type error")

LocalFree = windll.kernel32.LocalFree;
memcpy = cdll.msvcrt.memcpy;
CryptProtectData = windll.crypt32.CryptProtectData;
CryptUnprotectData = windll.crypt32.CryptUnprotectData;
CRYPTPROTECT_UI_FORBIDDEN = 0x01;


lambda x: decrypt(x)
