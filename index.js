require('dotenv').config( {path: '.env.' + process.env.NODE_ENV})
const Logger = require('./logger')
const StateMachine = require('javascript-state-machine')
const mqtt = require('mqtt')
const MqttClient = mqtt.connect(process.env.MQTT_URL)

const LowPowerSimulator = {
    ceiling: 5,
    floor: 0,
    generatePower: function () {
        return Math.floor(Math.random() * (this.ceiling - this.floor + 1) + this.floor)
    },
    StateMachine: new StateMachine({
        init: 'low-power',
        transitions: [
            { name: 'transition1', from:'low-power', to: 'mid-power' },
            { name: 'transition2', from:'mid-power', to: 'high-power' },
            { name: 'transition3', from:'high-power', to: 'mid-power' },
            { name: 'transition4', from:'high-power', to: 'low-power' },
            { name: 'transition5', from:'mid-power', to: 'low-power' }
        ],
        methods: {
            onTransition1: function() {
                LowPowerSimulator.ceiling = 15
                LowPowerSimulator.floor = 6
            },
            onTransition2: function() {
                this.ceiling = 50
                this.floor = 16
            },
            onTransition3: function() {
                this.ceiling = 15
                this.floor = 6
            },
            onTransition4: function() {
                this.ceiling = 5
                this.floor = 0
            },
            onTransition5: function() {
                LowPowerSimulator.ceiling = 5
                LowPowerSimulator.floor = 0
            }
        }
    }),
}

const HighPowerSimulator = {
    ceiling: 10,
    floor: 0,
    generatePower: function () {
        return Math.floor(Math.random() * (this.ceiling - this.floor + 1) + this.floor)
    },
    StateMachine: new StateMachine({
        init: 'low-power',
        transitions: [
            { name: 'transition1', from:'low-power', to: 'mid-power' },
            { name: 'transition2', from:'mid-power', to: 'high-power' },
            { name: 'transition3', from:'high-power', to: 'mid-power' },
            { name: 'transition4', from:'high-power', to: 'low-power' },
            { name: 'transition5', from:'mid-power', to: 'low-power' }
        ],
        methods: {
            onTransition1: function() {
                HighPowerSimulator.ceiling = 11
                HighPowerSimulator.floor = 750
            },
            onTransition2: function() {
                this.ceiling = 50
                this.floor = 16
            },
            onTransition3: function() {
                this.ceiling = 15
                this.floor = 6
            },
            onTransition4: function() {
                this.ceiling = 5
                this.floor = 0
            },
            onTransition5: function() {
                HighPowerSimulator.ceiling = 10
                HighPowerSimulator.floor = 0
            }
        }
    })
}

function MqttPublishLoop() {
    const req = {
        id: '5f040bbb2186f13674b85f93',
        power: LowPowerSimulator.generatePower(),
        state: LowPowerSimulator.StateMachine.state,
        ceiling: LowPowerSimulator.ceiling,
        floor: LowPowerSimulator.floor,
    }
    Logger('LowPowerSimulator ' + JSON.stringify(req))
    MqttClient.publish('socket/5eff0869be397a4138c3d96e/' + req.id + '/power', JSON.stringify(req))

    const req2 = {
        id: '5f048ae68ade5f0a6c64905c',
        power: HighPowerSimulator.generatePower(),
        state: HighPowerSimulator.StateMachine.state,
        ceiling: HighPowerSimulator.ceiling,
        floor: HighPowerSimulator.floor,
    }
    Logger('HighPowerSimulator ' + JSON.stringify(req2))
    MqttClient.publish('socket/5eff0869be397a4138c3d96e/' + req2.id + '/power', JSON.stringify(req2))
}

let RandomDuration = 1000

function StateRandomiser() {
    const value = Math.floor(Math.random() * (10 - 1 + 1) + 1)
    const value2 = Math.floor(Math.random() * (10 - 1 + 1) + 1)

    if ( value < 5 )
        if ( LowPowerSimulator.StateMachine.state === 'mid-power' ) {
            LowPowerSimulator.StateMachine.transition5()
            RandomDuration = 1000000
        }
    else
        if ( LowPowerSimulator.StateMachine.state === 'low-power' ) {
            LowPowerSimulator.StateMachine.transition1()
            RandomDuration = 500000
        }

    if ( value2 < 5 )
        if ( HighPowerSimulator.StateMachine.state === 'mid-power' ) {
            HighPowerSimulator.StateMachine.transition5()
            RandomDuration = 1000000
        }
        else
        if ( HighPowerSimulator.StateMachine.state === 'low-power' ) {
            HighPowerSimulator.StateMachine.transition1()
            RandomDuration = 500000
        }
}

setInterval(MqttPublishLoop, 1000)
setInterval(StateRandomiser, RandomDuration)
