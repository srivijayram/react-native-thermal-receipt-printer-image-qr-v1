/* eslint-disable react-native/no-inline-styles */
import { Picker} from '@react-native-picker/picker';
import { BluetoothEscposPrinter, BluetoothTscPrinter } from '@brooons/react-native-bluetooth-escpos-printer';

import * as React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Alert,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import {
  BLEPrinter,
  NetPrinter,
  USBPrinter,
  IUSBPrinter,
  IBLEPrinter,
  INetPrinter,
  ColumnAlignment,
  COMMANDS,
} from 'react-native-thermal-receipt-printer-image-qr';
import Loading from '../Loading';
import {DeviceType} from './FindPrinter';
import {navigate} from './App';
import AntIcon from 'react-native-vector-icons/AntDesign';
import QRCode from 'react-native-qrcode-svg';
import {useRef, useState} from 'react';
import {Buffer} from 'buffer';

import ThermalPrinterModule from 'react-native-thermal-printer';


import { join } from "path";

const printerList: Record<string, any> = {
  ble: BLEPrinter,
  net: NetPrinter,
  usb: USBPrinter,
};

export interface SelectedPrinter
  extends Partial<IUSBPrinter & IBLEPrinter & INetPrinter> {
  printerType?: keyof typeof printerList;
}

export const PORT: string = '9100';

export enum DevicesEnum {
  usb = 'usb',
  net = 'net',
  blu = 'blu',
}

const deviceWidth = Dimensions.get('window').width;
const EscPosEncoder = require('esc-pos-encoder');


export const HomeScreen = ({route}: any) => {
  const [selectedValue, setSelectedValue] = React.useState<
    keyof typeof printerList
  >(DevicesEnum.net);
  const [devices, setDevices] = React.useState([]);
  // const [connected, setConnected] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedPrinter, setSelectedPrinter] = React.useState<SelectedPrinter>(
    {},
  );

  const [state, setState] = useState({
    text:
      '[C]<img>https://via.placeholder.com/300.jpg</img>\n' +
      '[L]\n' +
      "[C]<u><font size='big'>ORDER N°045</font></u>\n" +
      '[L]\n' +
      '[C]================================\n' +
      '[L]\n' +
      '[L]<b>BEAUTIFUL SHIRT</b>[R]9.99e\n' +
      '[L]  + Size : S\n' +
      '[L]\n' +
      '[L]<b>AWESOME HAT</b>[R]24.99e\n' +
      '[L]  + Size : 57/58\n' +
      '[L]\n' +
      '[C]--------------------------------\n' +
      '[R]TOTAL PRICE :[R]34.98e\n' +
      '[R]TAX :[R]4.23e\n' +
      '[L]\n' +
      '[C]================================\n' +
      '[L]\n' +
      "[L]<font size='tall'>Customer :</font>\n" +
      '[L]Raymond DUPONT\n' +
      '[L]5 rue des girafes\n' +
      '[L]31547 PERPETES\n' +
      '[L]Tel : +33801201456\n' +
      '[L]\n' +
      "[C]<barcode type='ean13' height='10'>831254784551</barcode>\n" +
      "[C]<qrcode size='20'>http://www.developpeur-web.dantsu.com/</qrcode>",
  });


  async function printEscpos() {
    const textToPrint = 'eshipz!\nTesting print using raw mode.\n';
    // const rawBytes = textToRawBytes(textToPrint);
    // console.log('rawBytes :' + rawBytes)
    const columnWidths = [24, 24];
  
    const fcuser = 'John doe';
    const collectionRecieptNo = 121;
    
    
    try {
      const zpl =  '^XA^FO50,50^ADN,36,20^FDHello, Zebra!^FS^XZ';
    
      //await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
  
      const printResult = await BluetoothEscposPrinter.printText(textToPrint, { });
      console.log('Print successful:', printResult);
      //await BluetoothEscposPrinter.printText('\r\n', {});
  
      // await BluetoothEscposPrinter.printText(zpl, {});
  
      // await BluetoothEscposPrinter.printText('\r\n\r\n\r\n', {});
  
      // await BluetoothEscposPrinter.printText('\r\n', {});
  
      // await BluetoothEscposPrinter.printColumn(
      //   [48],
      //   [BluetoothEscposPrinter.ALIGN.LEFT],
      //   ['Printed By:'+ fcuser],
      //   {},
      // );
  
    } catch (e:any) {
      Alert.alert(e.message || 'ERROR');
      console.log(e || ' EscposPrinter ERROR')
    }
  }

  let QrRef = useRef<any>(null);
  const [selectedNetPrinter, setSelectedNetPrinter] =
    React.useState<DeviceType>({
      device_name: 'My Net Printer',
      host: '192.168.0.101', // your host
      port: PORT, // your port
      printerType: DevicesEnum.net,
    });

  React.useEffect(() => {
    if (route.params?.printer) {
      setSelectedNetPrinter({
        ...selectedNetPrinter,
        ...route.params.printer,
      });
    }
  }, [route.params?.printer]);

  const getListDevices = async () => {
    const Printer = printerList[selectedValue];
    // get list device for net printers is support scanning in local ip but not recommended
    if (selectedValue === DevicesEnum.net) {
      await Printer.init();
      setLoading(false);
      return;
    }
    requestAnimationFrame(async () => {
      try {
        await Printer.init();
        const results = await Printer.getDeviceList();
        setDevices(
          results?.map((item: any) => ({
            ...item,
            printerType: selectedValue,
          })),
        );
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    });
  };

  React.useEffect(() => {
    setLoading(true);
    getListDevices().then();
  }, [selectedValue]);

  const onPress = async () => {
    try {
      console.log('We will invoke the native module here!');
      //await ThermalPrinterModule.printTcp({ payload: state.text });

      
      //bluetooth
      const res = await ThermalPrinterModule.printBluetooth({
          macAddress: '00:00:02:04:40:27',
          payload: state?.text,
          //autoCut: true,
      });
    

      console.log('done printing-- ' + res);
    } catch (err:any) {
      //error handling
      console.log('err-- '+err);
    }
  };

  const handleConnectSelectedPrinter = async () => {
    setLoading(true);
    const connect = async () => {
      try {
        switch (
          selectedValue === DevicesEnum.net
            ? selectedNetPrinter.printerType
            : selectedPrinter.printerType
        ) {
          case 'ble':
            
            try {
              // if (connected) {
              // await NetPrinter.closeConn();
              // setConnected(!connected);
              // }
              if (!selectedPrinter?.inner_mac_address) {
                break
              }
              const res = await BLEPrinter.connectPrinter(
                selectedPrinter?.inner_mac_address || '',
              );
              setLoading(false);
              console.log('connect -> status', res);
              Alert.alert(
                'Connect successfully!',
                `Connected to ${res?.device_name ?? 'Printer'} !`,
              );
              // setConnected(true);
            } catch (err) {
              Alert.alert('Connect failed!', `${err} !`);
            }
            break;

          case 'net':
            if (!selectedNetPrinter) {
              break;
            }
            try {
              // if (connected) {
              // await NetPrinter.closeConn();
              // setConnected(!connected);
              // }
              const status = await NetPrinter.connectPrinter(
                selectedNetPrinter?.host || '',
                9100,
              );
              setLoading(false);
              console.log('connect -> status', status);
              Alert.alert(
                'Connect successfully!',
                `Connected to ${status.host ?? 'Printers'} !`,
              );
              // setConnected(true);
            } catch (err) {
              Alert.alert('Connect failed!', `${err} !`);
            }
            break;
          case 'usb':
            if (selectedPrinter?.vendor_id) {
              await USBPrinter.connectPrinter(
                selectedPrinter?.vendor_id || '',
                selectedPrinter?.product_id || '',
              );
            }
            break;
          default:
        }
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    await connect();
  };

  function textToRawBytes(text:any) {
    const escCommands = [
      27,  
      64,  
      ...text.split('').map((char:any) => char.charCodeAt(0)), 
      10,  
    ];
    return new Uint8Array(escCommands);
  }

  
  const handlePrint = async () => {
    try {
      const text = 'eshipz test'
      //const text1= '0x1D, 0x56, 0x41, 0x10'
      const rawText = textToRawBytes(text)
      const Printer = printerList[selectedValue];
      // Printer.printText(rawText, {
      //   cut: false,
      //   type:'raw'
      // });
      //Printer.printRaw(text1)
      Printer.printText(text)
      // Printer.printImage(
      //   "https://media-cdn.tripadvisor.com/media/photo-m/1280/1b/3a/bd/b5/the-food-bill.jpg",
      //   {
      //     imageWidth: 575,
      //     // imageHeight: 1000,
      //     // paddingX: 100
      //   }
      // );
      // Printer.printImage(
      //   'https://sportshub.cbsistatic.com/i/2021/04/09/9df74632-fde2-421e-bc6f-d4bf631bf8e5/one-piece-trafalgar-law-wano-anime-1246430.jpg',
      // );
      //Printer.printBill('sample text');
      //console.log('res' + res)
    } catch (err) {
      console.log(err);
    }
  };

  const handlePrintBill = async () => {
    let address = '2700 S123 Grand Ave, Los Angeles, CA 90007223, USA.';
    const BOLD_ON = COMMANDS.TEXT_FORMAT.TXT_BOLD_ON;
    const BOLD_OFF = COMMANDS.TEXT_FORMAT.TXT_BOLD_OFF;
    const CENTER = COMMANDS.TEXT_FORMAT.TXT_ALIGN_CT;
    const OFF_CENTER = COMMANDS.TEXT_FORMAT.TXT_ALIGN_LT;
    try {
      const getDataURL = () => {
        (QrRef as any).toDataURL(callback);
      };
      const callback = async (dataURL: string) => {
        let qrProcessed = dataURL.replace(/(\r\n|\n|\r)/gm, '');
        // Can print android and ios with the same type or with encoder for android
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
          const Printer: typeof NetPrinter = printerList[selectedValue];
          Printer.printImage(
            `https://sportshub.cbsistatic.com/i/2021/04/09/9df74632-fde2-421e-bc6f-d4bf631bf8e5/one-piece-trafalgar-law-wano-anime-1246430.jpg`,
            {
              imageWidth: 300,
              imageHeight: 300,
            },
          );
          Printer.printText(`${CENTER}${BOLD_ON} BILLING ${BOLD_OFF}\n`);
          Printer.printText(`${CENTER}${address}${OFF_CENTER}`);
          Printer.printText('090 3399 031 555\n');
          Printer.printText(`Date : 15- 09 - 2021 /15 : 29 : 57 / Admin`);
          Printer.printText(`Product : Total - 4 / No. (1,2,3,4)\n`);
          Printer.printText(
            `${CENTER}${COMMANDS.HORIZONTAL_LINE.HR_80MM}${CENTER}`,
          );
          let orderList = [
            ['1. Skirt Palas Labuh Muslimah Fashion', 'x2', '500$'],
            ['2. BLOUSE ROPOL VIRAL MUSLIMAH FASHION', 'x4222', '500$'],
            [
              '3. Women Crew Neck Button Down Ruffle Collar Loose Blouse',
              'x1',
              '30000000000000$',
            ],
            ['4. Retro Buttons Up Full Sleeve Loose', 'x10', '200$'],
            ['5. Retro Buttons Up', 'x10', '200$'],
          ];
          let columnAlignment = [
            ColumnAlignment.LEFT,
            ColumnAlignment.CENTER,
            ColumnAlignment.RIGHT,
          ];
          let columnWidth = [46 - (7 + 12), 7, 12];
          const header = ['Product list', 'Qty', 'Price'];
          Printer.printColumnsText(header, columnWidth, columnAlignment, [
            `${BOLD_ON}`,
            '',
            '',
          ]);
          Printer.printText(
            `${CENTER}${COMMANDS.HORIZONTAL_LINE.HR3_80MM}${CENTER}`,
          );
          for (let i in orderList) {
            Printer.printColumnsText(
              orderList[i],
              columnWidth,
              columnAlignment,
              [`${BOLD_OFF}`, '', ''],
            );
          }
          Printer.printText(`\n`);
          Printer.printImageBase64(qrProcessed, {
            imageWidth: 50,
            imageHeight: 50,
          });
          Printer.printBill(`${CENTER}Thank you\n`, {beep: false});
        } else {
          // optional for android
          // android
          const Printer = printerList[selectedValue];
          const encoder = new EscPosEncoder();
          let _encoder = encoder
            .initialize()
            .align('center')
            .line('BILLING')
            //.qrcode('https://nielsleenheer.com')
            .encode();
          let base64String = Buffer.from(_encoder).toString('base64');
          Printer.printRaw(base64String);
        }
      };
      getDataURL();
    } catch (err) {
      console.warn(err);
    }
  };

  const handlePrintBillWithImage = async () => {
    const Printer: typeof NetPrinter = printerList[selectedValue];
    Printer.printImage(
      'https://media-cdn.tripadvisor.com/media/photo-m/1280/1b/3a/bd/b5/the-food-bill.jpg',
      {
        imageWidth: 575,
        // imageHeight: 1000,
        // paddingX: 100
      },
    );
    Printer.printBill('', {beep: false});
  };

  const handleChangePrinterType = async (type: keyof typeof printerList) => {
    setSelectedValue(prev => {
      printerList[prev].closeConn();
      return type;
    });
    setSelectedPrinter({});
  };

  const findPrinter = () => {
    navigate('Find');
  };

  const posNavigate = () => {
    navigate('PosPrinter');
  };

  const BleNavigate = () => {
    navigate('Ble');
  };

  const onChangeText = (text: string) => {
    setSelectedNetPrinter({...selectedNetPrinter, host: text});
  };

  const _renderNet = () => (
    <>
      <Text style={[styles.text, {color: '#FFF', marginLeft: 0}]}>
        Your printer ip....
      </Text>
      <TextInput
        style={{
          borderBottomWidth: 1,
          height: 45,
        }}
        placeholder={'Your printer port...'}
        value={selectedNetPrinter?.host}
        onChangeText={onChangeText}
      />
      <View
        style={{
          marginTop: 10,
        }}>
        <TouchableOpacity
          style={[styles.button, {backgroundColor: 'grey', height: 30}]}
          // disabled={!selectedPrinter?.device_name}
          onPress={findPrinter}>
          <AntIcon name={'search1'} color={'white'} size={18} />
          <Text style={styles.text}>Find your printers</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const _renderOther = () => (
    <>
      <Text style={styles.title}>Select printer: </Text>
      <Picker
        selectedValue={selectedPrinter}
        onValueChange={setSelectedPrinter}>
        {devices !== undefined &&
          devices?.length > 0 &&
          devices?.map((item: any, index) => (
            <Picker.Item
              label={item.device_name}
              value={item}
              key={`printer-item-${index}`}
            />
          ))}
      </Picker>
    </>
  );

  return (
    <View style={styles.container}>
      {/* Printers option */}
      <View style={styles.section}>
        <Text style={styles.title}>Select printer type: </Text>
        <Picker
          selectedValue={selectedValue}
          mode="dropdown"
          onValueChange={handleChangePrinterType}>
          {Object.keys(printerList).map((item, index) => (
            <Picker.Item
              label={item.toUpperCase()}
              value={item}
              key={`printer-type-item-${index}`}
            />
          ))}
        </Picker>
      </View>
      {/* Printers List */}
      <View style={styles.section}>
        {selectedValue === 'net' ? _renderNet() : _renderOther()}
        {/* Buttons Connect */}
        <View
          style={[
            styles.buttonContainer,
            {
              marginTop: 50,
            },
          ]}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleConnectSelectedPrinter}>
            <AntIcon name={'disconnect'} color={'white'} size={18} />
            <Text style={styles.text}>Connect</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: 'blue'}]}
            onPress={posNavigate}>
            <AntIcon name={'printer'} color={'white'} size={18} />
            <Text style={styles.text}>pos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: 'blue'}]}
            onPress={BleNavigate}>
            <AntIcon name={'printer'} color={'white'} size={18} />
            <Text style={styles.text}>pos</Text>
          </TouchableOpacity>
        </View> */}
        {/* Button Print sample */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: 'blue'}]}
            onPress={handlePrint}>
            <AntIcon name={'printer'} color={'white'} size={18} />
            <Text style={styles.text}>Print sample</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: 'blue'}]}
            onPress={printEscpos}>
            <AntIcon name={'printer'} color={'white'} size={18} />
            <Text style={styles.text}>Print using escpos</Text>
          </TouchableOpacity>
        </View>
        {/* Button Print bill */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: 'blue'}]}
            onPress={handlePrintBill}>
            <AntIcon name={'profile'} color={'white'} size={18} />
            <Text style={styles.text}>Print bill</Text>
          </TouchableOpacity>
        </View>
        {/* Button Print bill With Image */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, {backgroundColor: 'blue'}]}
            onPress={handlePrintBillWithImage}>
            <AntIcon name={'profile'} color={'white'} size={18} />
            <Text style={styles.text}>Print bill With Image</Text>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.qr}>
          <QRCode value="hey" getRef={(el: any) => (QrRef = el)} />
        </View> */}
      </View>
      <Loading loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor:'#000'
  },
  section: {},
  rowDirection: {
    flexDirection: 'row',
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    height: 40,
    width: deviceWidth / 1.5,
    alignSelf: 'center',
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  text: {
    color: 'white',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  title: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  qr: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});
