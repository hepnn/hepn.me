---
title: 'E-talons and it's insides'
description: 'Decoding the data inside the Riga public transport card'
pubDate: 'May 03 2024'
isFeatured: false
heroImage: '/etalons.jpg'
---

=========================

I recently developed an timetable app for Rigas satiksme, called Rigify, while thinking about what new features I could implement, I thought of the ability to read the tickets using NFC and display the data for users. This data would include initially bought ride count, ride count left, date of ticket purchase, past rides and their information. Just scan the card using NFC on your mobile and display the data, easy enough right? Well, It turned out otherwise and led me to a painful journey of decoding hex data. Researching for information already available I found only a single source from 2009, even tho being a decade old, it was mostly still accurate. here. At the beginning while providing my own findings, I am going to be referencing much of what the author above has written, no need to reinvent the wheel.

What's inside the E-talons?
===========================

*   The card’s chip follows an ISO 14443-3 (Type A) format and appears to be a Mifare Ultralight MF0ICU1.
*   The Mifare UL comprises 64 bytes that are separated into 16 blocks, with each block containing 4 bytes. Out of these, 12 blocks are used for the user memory, which totals 48 bytes.
*   The yellow e-talons card is available for 1, 2, 4, 5, 10, and 20 rides, even though the card’s design supports up to 32 rides.
*   The card’s UID (serial number) is pre-set at manufacturing and cannot be changed.
*   OTP (One-Time Programmable) fields are used for registering the remaining rides, which cannot be changed. Therefore, this write-up will not cover how to hack the card and obtain unlimited rides.

Example data:

1.  057B9D6B
2.  5C5D54E9
3.  BC157000
4.  C0FFFFFF
5.  B91D2065
6.  001D513A
7.  00000000
8.  0AA85D28
9.  BB0BA382
10.  0080DA45
11.  8BC20200
12.  0A38A428
13.  BB0BA382
14.  00804346
15.  476A0100

\- Card purchase date: 29-12-2019

\- 10 inital rides, 0 remaining

\- 1st ride: 20-07-2020 15:49, Bus 3, In direction of Sarkandaugava

\- 2nd ride: 19-07-2020 19:19, Bus 3, In direction of Sarkandaugava

Lets decode it

The cards memory structure
==========================

The e-talon card has a well-defined (but weird) memory structure that stores important information about the card and its usage. Among other things, the card can store up to 2 past rides made, with the oldest ride being overwritten when a new one is added. The memory structure comprises several pages, with each page storing specific information.

Newest past ride data is stored on pages **12-15**

Oldest past ride data is stored on pages **8-11**

The data does not differ in any way for these rides, same structure applies to both.

Page 0-1
========

#### Cards UID

It is the number on the back of the e-talon. The card uses a 6-byte UID, which starts from the other end. While the Mifare UL documentation suggests that the UID starts from a different byte, It appears that byte 0 is the manufacturer code and is always constant. Therefore, the card’s UID can be obtained by reversing the byte order and converting it to decimal. The first byte is just added, so the UID can be represented as **1-256548552875387.**

##### For example:

![UID example](/uid.png)

*   7B 9D 5C 5D 54 E9
*   Reversed: E9 54 5D 5C 9D 7B
*   Decimal: 256548552875387
*   Add '1' in front: 1-256548552875387

Page 6
======

#### Amount of rides

Page 6 bytes 2 and 3, Is responsible for the amount of initial rides (tickets) purchased. While I haven’t found a definitive algorithm for how these bytes are encoded, I have established that they are close enough to the service code bytes, which are listed below:

*   1 ride: AD/AE 39
*   2 rides: CD/CE 39
*   4 rides: 0D/0E 3A
*   5 rides: 2D/2E 3A
*   10 rides: 4D/4E 3A
*   20 rides: 6D/6E 3A

By matching the byte to the closest service code in the list, we can determine the initial number of rides with almost 100% accuracy.

#### Amount of rides left

If the initial rides are 1 to 10, the rides count remaning is stored at page 7

If the initial rides are 20, the rides count remaning is stored at page 3

Page 12
=======

#### Transport type

Page 12 Byte 0 indicates the transport type, if the byte is:

*   08 -> Bus
*   09 -> Tram
*   0A -> Trolley

#### Time and Date

Few keypoints I have found about this:

*   Time goes up to 33:36 (hh:mm) and then resets, incrementing a day
*   Date of purchase is unknown
*   Page 12 Byte 1 -> Minutes

A minute is incremented every 8 hex numberes. (e.g. 0x60 till 0x68 is 1 minute, 0x68 till 0x70 is another minute)

*   Page 12 Byte 2 -> Hours (minutes)

32 minutes are incremented every hex number (e.g. 0x63 -> 18:54, 0x64 -> 19:26, 0x65 -> 19:58)

*   Page 12 Byte 3 -> Date (?)

Something to do with the date, most likely it is -> Purchase date of the card - 359 days + 4 days for every hex number in byte 3. For example: Purchase date -> 02.09.2021 02.09.2021 - 359 days = 08.09.2020, 08.09.2020 + 5B (91 in dec) = 07.09.2021. Which should be our rides date if we ignore the time.

Page 13
=======

#### Transport number

Byte 0 + Byte 1

If the first two bytes are E0B3, it is null. It means that there is no ride stored there.

1.  We convert the bytes using little endian conversion
2.  Convert to decimal
3.  Remove 2 leading numbers and any zeros
4.  We get the bus number, for example:

*   FF03 -> 0x3FF
*   0x3FF -> 1023
*   23

Page 14
=======

#### Direction of ride (stop name)

##### Byte 3

*   It seems that byte is responsible for the direction you are going
*   E.g. 86 represents last stop, changing it to 44 reverses the direction
*   The range of valid bytes for one direction is from 40 to 7F, while the other direction is represented by bytes from 80 to BF

##### Byte 2

This indicates whether the ticket has been checked and scanned by the ticket inspector. If the byte is:

*   80 -> Checked
*   00 -> Not checked

Code
====

##### Reading the card

```
val nfcA = NfcA.get(tag)

nfcA.connect()
                        
val data = ByteArray(16 * 4)
for (page in 0..15) {
    val offset = page * 4
    val chunk = nfcA.transceive(byteArrayOf(0x30.toByte(), page.toByte()))
     System.arraycopy(chunk, 0, data, offset, 4)
}

return data
```
                

This function reads data from an NFC tag that supports NFC-A tech (used in e-talons). It connects to the tag and reads 16 pages of 4 bytes each, copying the chunks of data into a ByteArray. The data we return is going to be used in all of our functions below and will indicate 64 bytes (4\*12).

#### Helper methods

##### Byte to hex

```

private fun bytesToHex(bytes: ByteArray): String {

    // Create a new StringBuilder with enough capacity to hold the output
    val hex = StringBuilder(bytes.size * 2)
                        
    // Iterate over each byte in the input array
    bytes.forEach { byte ->
        // Append the two hexadecimal digits for this byte to the StringBuilder
        hex.append(HEX_CHARS[(byte.toInt() and 0xF0) ushr 4])
        hex.append(HEX_CHARS[byte.toInt() and 0x0F])
    }
                        
    // Return the final string representation of the hexadecimal values
    return hex.toString()
}
                        
// A constant array of the 16 hexadecimal characters
private val HEX_CHARS = "0123456789ABCDEF".toCharArray()
```
                    
                

##### Get page from data

```
private fun getPage(data: ByteArray, pageNumber: Int): ByteArray {
    return data.copyOfRange(pageNumber * 4, (pageNumber + 1) * 4)
}
```
                    
                

##### Get byte from page

```
private fun getBytes(data: ByteArray, start: Int, end: Int): ByteArray {
    return data.copyOfRange(start, end)
}
```
                    
                

##### Card UID

```
private fun getCardId(data: ByteArray): String? {
    val page1 = bytesToHex(byteArrayOf(data[7], data[6], data[5], data[4]))
    val page0 = bytesToHex(byteArrayOf(data[1], data[2]))
                    
    val page0Reversed = page0.substring(2, 4) + page0.substring(0, 2)
    val reversedUid = page1 + page0Reversed
                    
    val cardIdHex = reversedUid.substring(0, 12)
    val cardIdDec = java.lang.Long.parseLong(cardIdHex, 16)

    return "1-$cardIdDec"
}
```
                

##### Past ride bus numbers

```                
private fun getBusNumber(page: ByteArray): String {
    val busNumber = ((page[1].toInt() and 0xFF) shl 8) or (page[0].toInt() and 0xFF)
    var busNumberStr = busNumber.toString().trimStart('0').takeLast(2)
    if (busNumberStr.startsWith("0")) {
        busNumberStr = busNumberStr.substring(1)
    }
    return busNumberStr
}
```
                    
                

Usage example

```
private fun getFirstBusNumber(data: ByteArray): String? {
    val page13 = getPage(data, 13)
    return if (bytesToHex(getBytes(page13,0, 2)) == "E0B3") {
        null
    } else {
        getBusNumber(page13)
    }
}
```                    
                

##### Transport type

```
private fun getFirstTransportType(data: ByteArray): String {
    val hexString = String.format("%02X", firstByte)
    return hexString
}
```
                

##### Time and Date

```
fun getFirstRideTime(data: ByteArray): String {
    val page12 = getPage(data, 12)
    val hexValue = page12[2].toInt() and 0xFF
    val hexCount = data.size / 2
    // Calculate the total minutes
    var totalMinutes = hexValue * 32
    // Add additional minutes due to full cycles
    val cycles = (hexCount - 1) / 40
    totalMinutes += cycles * 40 * 32
    // Calculate the hours and minutes separately
    var hours = totalMinutes / 60
    var minutes = totalMinutes % 60
    // Check if the total time has exceeded 33:36
    if (hours >= 33 && minutes >= 36) {
    hours -= 33
    minutes -= 36
    }
    // Format the time as a string in hh:mm format
    return "%02d:%02d".format(hours, minutes)
}
```

##### Initial ticket amount

``` 
private fun getInitialTickets(data: ByteArray): Int {
    val page6 = getPage(data, 6)
    val byte1 = page6[2]
    val byte2 = page6[3]

    val serviceCodes = mapOf(
        0xAD.toByte() to 1,
        0xAE.toByte() to 1,
        0xCD.toByte() to 2,
        0xCE.toByte() to 2,
        0x0D.toByte() to 4,
        0x0E.toByte() to 4,
        0x2D.toByte() to 5,
        0x2E.toByte() to 5,
        0x4D.toByte() to 10,
        0x4E.toByte() to 10,
        0x6D.toByte() to 20,
        0x6E.toByte() to 20
    )
    var closestServiceCode: Byte? = null
    for (serviceCodeByte in serviceCodes.keys) {
    if (closestServiceCode == null ||
     Math.abs(serviceCodeByte.toInt() - byte1.toInt()) < Math.abs(closestServiceCode.toInt() - byte1.toInt())) {
    closestServiceCode = serviceCodeByte
    }
    }
return serviceCodes[closestServiceCode] ?: 0
}
```
                    
                

The App
=======

Afterwards I made a Flutter app which utilises my findings, its open source and can be found here: [https://github.com/hepnn/E-talons](https://github.com/hepnn/E-talons)