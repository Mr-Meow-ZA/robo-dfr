/**
 * The user can select the 8 steering gear controller.
 */
enum Servos {
    S1 = 0x08,
    S2 = 0x07,
    S3 = 0x06,
    S4 = 0x05,
    S5 = 0x04,
    S6 = 0x03,
    S7 = 0x02,
    S8 = 0x01
};


//% weight=100 block="dfrobo"
namespace dfrobotarm {

    const PCA9685_ADDRESS = 0x40
    const MODE1 = 0x00
    const MODE2 = 0x01
    const SUBADR1 = 0x02
    const SUBADR2 = 0x03
    const SUBADR3 = 0x04
    const PRESCALE = 0xFE
    const LED0_ON_L = 0x06
    const LED0_ON_H = 0x07
    const LED0_OFF_L = 0x08
    const LED0_OFF_H = 0x09
    const ALL_LED_ON_L = 0xFA
    const ALL_LED_ON_H = 0xFB
    const ALL_LED_OFF_L = 0xFC
    const ALL_LED_OFF_H = 0xFD
    const STP_CHA_L = 2047
    const STP_CHA_H = 4095
    const STP_CHB_L = 1
    const STP_CHB_H = 2047
    const STP_CHC_L = 1023
    const STP_CHC_H = 3071
    const STP_CHD_L = 3071
    const STP_CHD_H = 1023
    const BYG_CHA_L = 3071
    const BYG_CHA_H = 1023
    const BYG_CHB_L = 1023
    const BYG_CHB_H = 3071
    const BYG_CHC_L = 4095
    const BYG_CHC_H = 2047
    const BYG_CHD_L = 2047
    const BYG_CHD_H = 4095

    let initialized = false

    function i2cWrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cCmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    //% block="i2cRead address %addr"
    export function readI2C():number{
        let tempVal = pins.i2cReadNumber(0x08, NumberFormat.Int8LE);

        return tempVal;
    }
    //$ block="whatDis address %ad1 size %size repeat %repeat"
    export function whatDisPin(ad1: number, size: number, repeat: boolean):Buffer{
        
        let buf = pins.i2cReadBuffer(ad1, size, repeat)
        return (buf);
    }
   
    
    function i2cReadServo(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function i2cRead(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function initPCA9685(): void {
        i2cWrite(PCA9685_ADDRESS, MODE1, 0x00)
        setFreq(50);
        initialized = true
    }

    function setFreq(freq: number): void {
        // Constrain the frequency
        let prescaleval = 25000000;
        prescaleval /= 4096;
        prescaleval /= freq;
        prescaleval -= 1;
        let prescale = prescaleval;//Math.floor(prescaleval + 0.5);
        let oldmode = i2cRead(PCA9685_ADDRESS, MODE1);
        let newmode = (oldmode & 0x7F) | 0x10; // sleep
        i2cWrite(PCA9685_ADDRESS, MODE1, newmode); // go to sleep
        i2cWrite(PCA9685_ADDRESS, PRESCALE, prescale); // set the prescaler
        i2cWrite(PCA9685_ADDRESS, MODE1, oldmode);
        control.waitMicros(5000);
        i2cWrite(PCA9685_ADDRESS, MODE1, oldmode | 0xa1);
    }

    function setPwm(channel: number, on: number, off: number): void {
        if (channel < 0 || channel > 15)
            return;

        let buf = pins.createBuffer(5);
        buf[0] = LED0_ON_L + 4 * channel;
        buf[1] = on & 0xff;
        buf[2] = (on >> 8) & 0xff;
        buf[3] = off & 0xff;
        buf[4] = (off >> 8) & 0xff;
        pins.i2cWriteBuffer(PCA9685_ADDRESS, buf);
    }
/***************************************************************************** */


    //% block="move %servoNum by %pos with min %min and max %max"
    export function incServoByDeg(servoNum: Servos, pos: number, min: number, max: number): void {

        if (pos > max) {
            pos = max;
        }
        if (pos < min) {
            pos = min;
        }
        motor.servo(servoNum, pos);

    }
    //% block="set servo %spos to degree %snum with min %minpos and max %maxpos"
    export function incServo(snum: Servos, spos: number, minpos: number, maxpos: number): void {

        spos = getServoPos(snum) + spos

        if (spos > maxpos) {
            spos = maxpos
        }
        if (spos < minpos) {
            spos = minpos
        }
        motor.servo(snum, spos)
    }

    //% block="get servo position for %ser"
    export function getServoPos(ser: Servos): number {

        let val = pins.i2cReadNumber(ser, NumberFormat.UInt8BE);
        return (val);

    }

}