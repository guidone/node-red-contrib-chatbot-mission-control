import React, { useState } from 'react';
import { Icon } from 'rsuite';
import moment from 'moment';

import { plug } from 'code-plug';

import './style.scss';

import Panel from '../../src/components/grid-panel';
import GenericMessage from '../../src/components/generic-chat-message';

import useSocket from '../../src/hooks/socket';


import classNames from 'classnames';

import SchemaForm from '../../src/components/schema-form';



const ChatPage = () => {

    const { permissions } = useCurrentUser();
    console.log('permissions', permissions)

    const [formValue, setFormValue] = useState({
      name: 'ciccio',
      poll: 42
    })



    const jsonSchema =
      {
        "definitions": {},
        "$schema": "http://yourdomain.com/schemas/myschema.json",
        "$id": "http://yourdomain.com/schemas/myschema.json",
        "type": "object",
        "title": "Configuratore",
        "default": null,
        "required": [
          "global",
          "digital",
          "analogInput",
          "analogOutput",
          "logic",
          "pid",
          "sms",
          "network"
        ],
        "options": {
          "collapsed": false,
          layout: 'panel'
        },
        "properties": {
          "digital": {
            "$id": "#/properties/digital",
            "type": "array",
            "title": "I/O Digitali",
            "default": null,
            "maxItems": 2,
            "minItems": 2,
            "options": {
              "collapsed": true,
              "labelAdd": "Aggiungi canale",
              "labelEmpty": "Nessun canale"
            },
            "items": {
              "$id": "#/properties/digital/items",
              "type": "object",
              "options": {
                "collapsed": true,
                layout: "horizontal-2x"
              },
              "title": "Canale",
              "default": null,
              "required": [
                "name",
                "type",
                "alarm",
                "thres",
                "priority",
                "return",
                "delay"
              ],
              "properties": {
                "name": {
                  "$id": "#/properties/digital/items/properties/name",
                  "type": "string",
                  "title": "Nome Canale",
                  "default": "The Channel",
                  "examples": [
                    "channel1"
                  ],
                  "pattern": "^(.*)$"
                },
                "type": {
                  "$id": "#/properties/digital/items/properties/type",
                  "type": "string",
                  "enum": [
                    "INPUT",
                    "OUTPUT"
                  ],
                  "title": "Tipo Canale",
                  "default": "INPUT",
                  "examples": [
                    "INPUT"
                  ]
                },
                "alarm": {
                  "$id": "#/properties/digital/items/properties/alarm",
                  "type": "boolean",
                  "title": "Allarme Canale",
                  "default": false,
                  "examples": [
                    false
                  ],
                  "format": "checkbox"
                },
                "thres": {
                  "$id": "#/properties/digital/items/properties/thres",
                  "type": "number",
                  "minimum": 30,
                  "title": "Soglia Allarme",
                  "default": 42,
                  "examples": [
                    0
                  ]
                },
                "return": {
                  "$id": "#/properties/digital/items/properties/return",
                  "type": "integer",
                  "enum": [
                    0,
                    1
                  ],
                  "title": "Allarme al rientro",
                  "default": 0,
                  "examples": [
                    0
                  ]
                },
                "priority": {
                  "$id": "#/properties/digital/items/properties/priority",
                  "type": "integer",
                  "enum": [
                    0,
                    1
                  ],
                  "title": "Priorità allarme",
                  "default": 0,
                  "examples": [
                    0
                  ]
                },
                "delay": {
                  "$id": "#/properties/digital/items/properties/delay",
                  "type": "integer",
                  "title": "Filtro Segnale (s)",
                  "default": 0,
                  "examples": [
                    0
                  ]
                }
              }
            }
          },


          "global": {
            "$id": "#/properties/global",
            "type": "object",
            "title": "Parametri Globali",
            "default": null,
            "required": [
              "name",
              "poll",
              "snooze",
              "upd",
              "alarm",
              "adc",
              "a-date"
            ],
            dependencies: {
              "a-date": ["a-time"],
              creditCard: {
                required: ['expirationDate'],
                properties: {
                  expirationDate: {
                    "$id": "#/properties/network/properties/mqtt/properties/expirationDate",
                    type: 'string',
                    format: 'date-time',
                    title: 'Credit Card Expiration Date',
                    options: {
                      help: 'Need to know when expires'
                    }
                  }
                }
              }
            },
            "options": {
              "collapsed": true,
              readPermission: 'global-read',
              writePermission: 'global-write'
            },
            "properties": {
              "name": {
                "$id": "#/properties/global/properties/name",
                "type": "string",
                "title": "Nome Periferica",
                "default": "Nomignolo",
                "minLength": 5,
                "examples": [
                  "KAON"
                ],
                "pattern": "^(.*)$",
                options: {
                  readPermission: 'read',
                  writePermission: 'write',
                  tooltip: 'I am a tooltip'
                }
              },
              "poll": {
                "$id": "#/properties/global/properties/poll",
                "type": "integer",
                "title": "Lettura Dati (s)",
                "default": 30,
                "examples": [
                  1
                ]
              },
              "alive": {
                "$id": "#/properties/network/properties/mqtt/properties/alive",
                "type": "boolean",
                "title": "Alive",
                "default": false,
                "examples": [
                  false
                ],
                "format": "checkbox"
              },
              "a-date": {
                "$id": "#/properties/network/properties/mqtt/properties/a-date",
                "type": "string",
                "title": "A date",
                "format": "date-time"
              },
              "a-time": {
                "$id": "#/properties/network/properties/mqtt/properties/a-time",
                "type": "string",
                "title": "A time",
                "format": "time"
              },
              "tele": {
                "$id": "#/properties/network/properties/mqtt/properties/tele",
                "type": "boolean",
                "title": "Telemetria",
                "default": false,
                "examples": [
                  false
                ],
                "format": "checkbox"
              },
              creditCard: {
                "$id": "#/properties/network/properties/mqtt/properties/creditCard",
                title: 'Credit Card',
                type: 'string'
              }
            }
          },
          "logic": {
            "$id": "#/properties/logic",
            "type": "object",
            "title": "Funzioni Logiche",
            "options": {
              "collapsed": true
            },
            "required": [
              "comp1",
              "comp2"
            ],
            "properties": {
              "comp1": {
                "$id": "#/properties/logic/properties/comp1",
                "type": "object",
                "options": {
                  "collapsed": true,
                  "layout": "horizontal-3x"
                },
                "title": "Comparatore 1",
                "default": null,
                "required": [
                  "a",
                  "b",
                  "fun",
                  "out"
                ],
                "properties": {
                  "a": {
                    "$id": "#/properties/logic/properties/comp1/properties/a",
                    "type": "string",
                    "enum": [
                      "CH1",
                      "CH2",
                      "CH3",
                      "CH4",
                      "CH5",
                      "CH6",
                      "CH7",
                      "CH8",
                      "AI1",
                      "AI2",
                      "AI3",
                      "AI4"
                    ],
                    "title": "Input A",
                    "default": "",
                    "examples": [
                      "CH1"
                    ],
                    "options": {
                      readPermission: 'read',
                      writePermission: 'write'
                    },
                    "pattern": "^(.*)$"
                  },
                  "b": {
                    "$id": "#/properties/logic/properties/comp1/properties/b",
                    "type": "string",
                    "enum": [
                      "CH1",
                      "CH2",
                      "CH3",
                      "CH4",
                      "CH5",
                      "CH6",
                      "CH7",
                      "CH8",
                      "AI1",
                      "AI2",
                      "AI3",
                      "AI4"
                    ],
                    "title": "Input B",
                    "default": "",
                    "examples": [
                      "CH2"
                    ],
                    "pattern": "^(.*)$"
                  },
                  "fun": {
                    "$id": "#/properties/logic/properties/comp1/properties/fun",
                    "type": "string",
                    "enum": [
                      "&",
                      "|",
                      "<",
                      "="
                    ],
                    "title": "Funzione Logica",
                    "default": "",
                    "examples": [
                      "="
                    ],
                    "pattern": "^(.*)$"
                  },
                  "out": {
                    "$id": "#/properties/logic/properties/comp1/properties/out",
                    "type": "string",
                    "enum": [
                      "CH1",
                      "CH2",
                      "CH3",
                      "CH4",
                      "CH5",
                      "CH6",
                      "CH7",
                      "CH8",
                      "AI1",
                      "AI2",
                      "AI3",
                      "AI4"
                    ],
                    "title": "Output",
                    "default": "",
                    "examples": [
                      "CH7"
                    ],
                    "pattern": "^(.*)$"
                  }
                }
              },
              "comp2": {
                "$id": "#/properties/logic/properties/comp2",
                "type": "object",
                "options": {
                  "collapsed": true,
                  layout: "horizontal-3x"
                },
                "title": "Comparatore 2",
                "default": null,
                "required": [
                  "a",
                  "b",
                  "fun",
                  "out"
                ],
                "properties": {
                  "a": {
                    "$id": "#/properties/logic/properties/comp2/properties/a",
                    "type": "string",
                    "enum": [
                      "CH1",
                      "CH2",
                      "CH3",
                      "CH4",
                      "CH5",
                      "CH6",
                      "CH7",
                      "CH8",
                      "AI1",
                      "AI2",
                      "AI3",
                      "AI4"
                    ],
                    "title": "Input A",
                    "default": "",
                    "examples": [
                      "AI1"
                    ],
                    "pattern": "^(.*)$"
                  },
                  "b": {
                    "$id": "#/properties/logic/properties/comp2/properties/b",
                    "type": "string",
                    "enum": [
                      "CH1",
                      "CH2",
                      "CH3",
                      "CH4",
                      "CH5",
                      "CH6",
                      "CH7",
                      "CH8",
                      "AI1",
                      "AI2",
                      "AI3",
                      "AI4"
                    ],
                    "title": "Input B",
                    "default": "",
                    "examples": [
                      "AI2"
                    ],
                    "pattern": "^(.*)$"
                  },
                  "fun": {
                    "$id": "#/properties/logic/properties/comp2/properties/fun",
                    "type": "string",
                    "enum": [
                      "&",
                      "|",
                      "<",
                      "="
                    ],
                    "title": "Funzione Logica",
                    "default": "",
                    "examples": [
                      "<"
                    ],
                    "pattern": "^(.*)$"
                  },
                  "out": {
                    "$id": "#/properties/logic/properties/comp2/properties/out",
                    "type": "string",
                    "enum": [
                      "CH1",
                      "CH2",
                      "CH3",
                      "CH4",
                      "CH5",
                      "CH6",
                      "CH7",
                      "CH8",
                      "AI1",
                      "AI2",
                      "AI3",
                      "AI4"
                    ],
                    "title": "Output",
                    "default": "",
                    "examples": [
                      "CH8"
                    ],
                    "pattern": "^(.*)$"
                  }
                }
              }
            }
          },
          "network": {
            "$id": "#/properties/network",
            "type": "object",
            "options": {
              "collapsed": true
            },
            "title": "Configurazione Network",
            "required": [
              "apn",
              "mqtt",
              "rest"
            ],
            "properties": {
              "apn": {
                "$id": "#/properties/network/properties/apn",
                "type": "object",
                "title": "Configurazione APN",
                "required": [
                  "name",
                  "user",
                  "pw"
                ],
                "properties": {
                  "name": {
                    "$id": "#/properties/network/properties/apn/properties/name",
                    "type": "string",
                    "title": "Nome APN",
                    "default": "",
                    "examples": [
                      "TM"
                    ],
                    "pattern": "^(.*)$"
                  },
                  "user": {
                    "$id": "#/properties/network/properties/apn/properties/user",
                    "type": "string",
                    "title": "Nome Utente",
                    "default": "",
                    "examples": [
                      ""
                    ]
                  },
                  "pw": {
                    "$id": "#/properties/network/properties/apn/properties/pw",
                    "type": "string",
                    "title": "Password",
                    "default": "",
                    "examples": [
                      ""
                    ]
                  }
                }
              },
              "mqtt": {
                "$id": "#/properties/network/properties/mqtt",
                "type": "object",
                "title": "Configurazione MQTT",
                "options": {
                  "collapsed": true
                },
                "required": [
                  "user",
                  "pw",
                  "broker",
                  "port",
                  "id",
                  "alive",
                  "tele",
                  "alarm",
                  "control",
                  "ota"
                ],
                "properties": {
                  "user": {
                    "$id": "#/properties/network/properties/mqtt/properties/user",
                    "type": "string",
                    "title": "Username",
                    "default": "",
                    "examples": [
                      ""
                    ]
                  },
                  "pw": {
                    "$id": "#/properties/network/properties/mqtt/properties/pw",
                    "type": "string",
                    "title": "Password",
                    "default": "",
                    "examples": [
                      ""
                    ]
                  },
                  "broker": {
                    "$id": "#/properties/network/properties/mqtt/properties/broker",
                    "type": "string",
                    "title": "Indirizzo Broker (IP o URL)",
                    "default": "",
                    "examples": [
                      "mqtt.eclipse.org"
                    ],
                    "pattern": "^(.*)$"
                  },
                  "port": {
                    "$id": "#/properties/network/properties/mqtt/properties/port",
                    "type": "integer",
                    "title": "Porta Broker",
                    "default": 1883,
                    "examples": [
                      1883
                    ]
                  },
                  "id": {
                    "$id": "#/properties/network/properties/mqtt/properties/id",
                    "type": "string",
                    "title": "ID dispositivo",
                    "default": "",
                    "examples": [
                      "dev1234"
                    ],
                    "pattern": "^(.*)$"
                  },
                  "alive": {
                    "$id": "#/properties/network/properties/mqtt/properties/alive",
                    "type": "boolean",
                    "title": "Alive",
                    "default": false,
                    "examples": [
                      false
                    ],
                    "format": "checkbox"
                  },
                  "tele": {
                    "$id": "#/properties/network/properties/mqtt/properties/tele",
                    "type": "boolean",
                    "title": "Telemetria",
                    "default": false,
                    "examples": [
                      false
                    ],
                    "format": "checkbox"
                  },
                  "alarm": {
                    "$id": "#/properties/network/properties/mqtt/properties/alarm",
                    "type": "boolean",
                    "title": "Allarmi",
                    "default": false,
                    "examples": [
                      true
                    ],
                    "format": "checkbox"
                  },
                  "control": {
                    "$id": "#/properties/network/properties/mqtt/properties/control",
                    "type": "boolean",
                    "title": "Controllo Remoto",
                    "default": false,
                    "examples": [
                      false
                    ],
                    "format": "checkbox"
                  },
                  "ota": {
                    "$id": "#/properties/network/properties/mqtt/properties/ota",
                    "type": "boolean",
                    "title": "Aggiornamento da Remoto",
                    "default": false,
                    "examples": [
                      true
                    ],
                    "format": "checkbox"
                  }
                }
              },
              "rest": {
                "$id": "#/properties/network/properties/rest",
                "type": "object",
                "title": "REST API",
                "required": [
                  "key",
                  "url",
                  "port",
                  "id",
                  "alive",
                  "tele",
                  "alarm",
                  "control",
                  "ota"
                ],
                "properties": {
                  "key": {
                    "$id": "#/properties/network/properties/rest/properties/key",
                    "type": "null",
                    "title": "Chiave API",
                    "default": null,
                    "examples": [
                      null
                    ]
                  },
                  "url": {
                    "$id": "#/properties/network/properties/rest/properties/url",
                    "type": "string",
                    "title": "Indirizzo Server",
                    "default": "",
                    "examples": [
                      "example.com"
                    ]
                  },
                  "port": {
                    "$id": "#/properties/network/properties/rest/properties/port",
                    "type": "integer",
                    "title": "Porta",
                    "default": 80,
                    "examples": [
                      80
                    ]
                  },
                  "id": {
                    "$id": "#/properties/network/properties/rest/properties/id",
                    "type": "string",
                    "title": "ID dispositivo",
                    "default": "",
                    "examples": [
                      "dev1234"
                    ],
                    "pattern": "^(.*)$"
                  },
                  "alive": {
                    "$id": "#/properties/network/properties/rest/properties/alive",
                    "type": "boolean",
                    "title": "Alive",
                    "default": false,
                    "examples": [
                      false
                    ],
                    "format": "checkbox"
                  },
                  "tele": {
                    "$id": "#/properties/network/properties/rest/properties/tele",
                    "type": "boolean",
                    "title": "Telemetria",
                    "default": false,
                    "examples": [
                      false
                    ],
                    "format": "checkbox"
                  },
                  "alarm": {
                    "$id": "#/properties/network/properties/rest/properties/alarm",
                    "type": "boolean",
                    "title": "Allarmi",
                    "default": false,
                    "examples": [
                      true
                    ],
                    "format": "checkbox"
                  },
                  "control": {
                    "$id": "#/properties/network/properties/rest/properties/control",
                    "type": "boolean",
                    "title": "Controllo Remoto",
                    "default": false,
                    "examples": [
                      false
                    ],
                    "format": "checkbox"
                  },
                  "ota": {
                    "$id": "#/properties/network/properties/rest/properties/ota",
                    "type": "boolean",
                    "title": "Aggiornamento da Remoto",
                    "default": false,
                    "examples": [
                      true
                    ],
                    "format": "checkbox"
                  }
                }
              }
            }
          }








        }
      }
    ;

    // ['read', 'write', 'global-read', 'global-write'],

    return (
      <div className="chat-demo" style={{ padding: 50}}>
        <div style={{width: '700px'}}>
          <SchemaForm
            value={formValue}
            jsonSchema={jsonSchema}
            permissions={permissions}
            onChange={newValue => {
              console.log('ON CHANGE', newValue)
              setFormValue(newValue);
            }}
          />
        </div>
      </div>
    );
  }




import { Message, Messages, Content, Metadata, ChatWindow, MessageComposer, MessageDate, MessageUser, UserStatus,
  MessageText,
  MessageButtons,
  MessagePhoto
} from '../../src/components/chat';
import useCurrentUser from '../../src/hooks/current-user';


// register permissions
plug(
  'permissions',
  null,
  {
    permission: 'read',
    name: 'Read',
    description: `Generic form read`,
    group: 'Schema Form Test'
  }
);
plug(
  'permissions',
  null,
  {
    permission: 'write',
    name: 'Write',
    description: `Generic form write`,
    group: 'Schema Form Test'
  }
);
plug(
  'permissions',
  null,
  {
    permission: 'global-read',
    name: 'Global Read',
    description: `Read global settings`,
    group: 'Schema Form Test'
  }
);
plug(
  'permissions',
  null,
  {
    permission: 'global-write',
    name: 'Global Write',
    description: `Write global settings`,
    group: 'Schema Form Test'
  }
);


plug('sidebar', null, { id: 'schema-form-demo', label: 'Schema form', url: '/mc/schema-form', icon: 'shield' })
plug('pages', ChatPage, { url: '/mc/schema-form', id: 'schema', title: 'Schema Form Demo' });
