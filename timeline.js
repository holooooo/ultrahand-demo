window.TIMELINE = {
 "duration": 168.343,
 "scenes": [
  {
   "id": "hook",
   "kicker": "机制拆解 · 第 5 期",
   "title": "载人航天",
   "start": 0.0,
   "voiceEnd": 13.265,
   "end": 14.165,
   "lines": [
    {
     "zh": "王国之泪的玩家，早就用究极手把林克送上天好几回了。",
     "en": "Tears of the Kingdom players have launched Link into the sky with Ultrahand more times than anyone can count.",
     "start": 0.6,
     "end": 4.576
    },
    {
     "zh": "那这玩意儿到底是怎么做出来的？",
     "en": "So how does this thing actually work?",
     "start": 4.796,
     "end": 6.91
    },
    {
     "zh": "任天堂没给代码，我只能自己写一个。顺便定个小目标：在网页里，完成一次载人航天。",
     "en": "Nintendo didn't share the code, so I wrote my own. Small goal while I'm at it: a crewed spaceflight, in a web page.",
     "start": 7.13,
     "end": 13.265
    }
   ]
  },
  {
   "id": "repo",
   "kicker": "先说福利",
   "title": "能玩 · 有源码",
   "start": 14.165,
   "voiceEnd": 19.889,
   "end": 20.789,
   "lines": [
    {
     "zh": "网页版直接能玩，链接在简介。点赞、收藏、关注之后，我把地址私信发你。",
     "en": "The web version is playable right now; link in the description. Like, favorite and follow, and I'll DM you the address.",
     "start": 14.165,
     "end": 19.889
    }
   ]
  },
  {
   "id": "gdc",
   "kicker": "00 · 任天堂的规矩",
   "title": "全都得是物理",
   "start": 20.789,
   "voiceEnd": 47.322,
   "end": 48.222,
   "lines": [
    {
     "zh": "先看任天堂自己怎么说。GDC 2024 上，王国之泪的物理负责人讲了一条铁律：",
     "en": "First, what Nintendo says. At GDC 2024, the game's physics lead laid down one iron rule:",
     "start": 20.789,
     "end": 26.535,
     "say": "先看任天堂自己怎么说。G D C 二零二四 上，王国之泪的物理负责人讲了一条铁律："
    },
    {
     "zh": "世界里所有东西，都必须是刚体加约束。没有例外。",
     "en": "Everything in the world must be rigid bodies plus constraints. No exceptions.",
     "start": 26.755,
     "end": 30.539
    },
    {
     "zh": "以前很多机关是按动画硬推的。在物理引擎眼里，它们重得没有上限。",
     "en": "A lot of old contraptions were pushed by animation. To the physics engine, they're infinitely heavy.",
     "start": 30.759,
     "end": 35.498
    },
    {
     "zh": "结果就是：你塞块冰到闸门底下，闸门直接把冰按进地里，还在那抽搐。",
     "en": "So if you slide a block of ice under a gate, the gate shoves it into the floor and keeps twitching.",
     "start": 35.718,
     "end": 40.923
    },
    {
     "zh": "改成真物理以后，冰把闸门顶住了，还顺便多出来一种解法。",
     "en": "With real physics, the ice holds the gate up, and that even opened up a new solution.",
     "start": 41.143,
     "end": 45.393
    },
    {
     "zh": "好，规矩懂了。开工。",
     "en": "Okay, rules understood. Let's build.",
     "start": 45.613,
     "end": 47.322
    }
   ]
  },
  {
   "id": "grab",
   "kicker": "01 · 抓",
   "title": "别瞬移",
   "start": 48.222,
   "voiceEnd": 64.737,
   "end": 65.637,
   "lines": [
    {
     "zh": "第一步，抓东西。从屏幕中间打一条射线，打中哪，就抓哪。",
     "en": "Step one: grab. Fire a ray from the middle of the screen; whatever it hits, you hold.",
     "start": 48.222,
     "end": 52.728
    },
    {
     "zh": "新手写法，是每帧直接把它挪到你面前。效果嘛，穿墙，还顺手把箱子全挤飞。",
     "en": "The beginner way is to teleport it in front of you every frame. Result: it phases through walls and launches every crate.",
     "start": 52.948,
     "end": 58.968
    },
    {
     "zh": "正确写法，是给它一个速度，让它自己飞过去。墙挡着就是挡着，这才叫物理。",
     "en": "The right way is to give it a velocity and let it fly there. If a wall's in the way, it stops. That's physics.",
     "start": 59.188,
     "end": 64.737
    }
   ]
  },
  {
   "id": "rotate",
   "kicker": "02 · 转",
   "title": "四十五度",
   "start": 65.637,
   "voiceEnd": 70.81,
   "end": 71.71,
   "lines": [
    {
     "zh": "第二步，转。一下四十五度，转完对齐。不然你这辈子都摆不正一块木板。",
     "en": "Step two: rotate. Forty-five degrees a press, then snap. Otherwise you'll never get a plank straight.",
     "start": 65.637,
     "end": 70.81
    }
   ]
  },
  {
   "id": "find",
   "kicker": "03 · 找点",
   "title": "粘哪儿",
   "start": 71.71,
   "voiceEnd": 81.407,
   "end": 82.307,
   "lines": [
    {
     "zh": "第三步，找粘哪儿。举着东西的时候，每一帧都在算：离我最近的是谁，差多远。",
     "en": "Step three: where to glue. While you're holding something, every frame asks: who's closest, and how far?",
     "start": 71.71,
     "end": 77.556
    },
    {
     "zh": "够近了，就拉出这根线，意思是：松手就粘这儿。",
     "en": "Close enough, and this line appears. It means: let go and it sticks here.",
     "start": 77.776,
     "end": 81.407
    }
   ]
  },
  {
   "id": "glue",
   "kicker": "04 · 粘",
   "title": "关节还是焊死",
   "start": 82.307,
   "voiceEnd": 99.483,
   "end": 100.383,
   "lines": [
    {
     "zh": "第四步，粘。这里有个岔路口。",
     "en": "Step four: glue. Here the road forks.",
     "start": 82.307,
     "end": 84.626
    },
    {
     "zh": "要么两块还是两块，中间加个关节拉着；要么干脆焊成一整块。",
     "en": "Either they stay two pieces with a joint holding them, or you weld them into one solid thing.",
     "start": 84.846,
     "end": 89.133
    },
    {
     "zh": "拿座桥试试，砸块石头。关节版会弯会晃，焊死的那版纹丝不动。",
     "en": "Let's test a bridge and drop a rock. The joint version bends and wobbles; the welded one doesn't budge.",
     "start": 89.353,
     "end": 94.347
    },
    {
     "zh": "游戏里用的哪种？任天堂没说。我猜是关节，因为大家造的车都在晃。",
     "en": "Which one does the game use? Nintendo never said. My guess is joints, because everyone's cars wobble.",
     "start": 94.567,
     "end": 99.483
    }
   ]
  },
  {
   "id": "carry",
   "kicker": "05 · 搬",
   "title": "整坨一起走",
   "start": 100.383,
   "voiceEnd": 123.336,
   "end": 124.236,
   "lines": [
    {
     "zh": "第五步，搬。抓住一块，整坨都得跟着走。",
     "en": "Step five: carry. Grab one piece and the whole build has to come along.",
     "start": 100.383,
     "end": 103.632
    },
    {
     "zh": "要是只拽一块，后面全靠关节拖着，长了就成了面条。",
     "en": "Drag just one piece and the rest hangs off the joints. Make it long and you've got noodles.",
     "start": 103.852,
     "end": 107.784
    },
    {
     "zh": "所以每一块都朝同一个目标一起动，就稳了。",
     "en": "So every piece moves toward the same target together, and it holds.",
     "start": 108.004,
     "end": 110.877
    },
    {
     "zh": "还有，玩家测出来一次最多粘二十一个零件。为什么是二十一？任天堂没解释。",
     "en": "Also, players found you can glue at most 21 parts. Why 21? Nintendo never explained.",
     "start": 111.097,
     "end": 116.898
    },
    {
     "zh": "我猜跟这个有关：零件越多，越难算。物理引擎只算一遍是面条，算八遍才站得直。",
     "en": "My guess: more parts, harder math. Let the engine iterate once and it's a noodle; eight times and it stands up.",
     "start": 117.118,
     "end": 123.336
    }
   ]
  },
  {
   "id": "power",
   "kicker": "06 · 动力",
   "title": "没有车辆程序",
   "start": 124.236,
   "voiceEnd": 138.253,
   "end": 139.153,
   "lines": [
    {
     "zh": "第六步，上动力。风扇很简单，就是一直在它屁股后面推。",
     "en": "Step six: power. A fan is simple: it just keeps pushing from behind.",
     "start": 124.236,
     "end": 128.458
    },
    {
     "zh": "轮子得能转，所以只能用转轴连着，再加个马达去拧。",
     "en": "A wheel has to spin, so it hangs on an axle joint with a motor turning it.",
     "start": 128.678,
     "end": 132.498
    },
    {
     "zh": "任天堂说，游戏里压根没有车辆程序。车，就是轮子加木板，自己凑出来的。",
     "en": "Nintendo says there's no vehicle code at all. A car is just wheels and planks that happen to add up.",
     "start": 132.718,
     "end": 138.253
    }
   ]
  },
  {
   "id": "launch",
   "kicker": "07 · 载人航天",
   "title": "三，二，一",
   "start": 139.153,
   "voiceEnd": 156.422,
   "end": 157.322,
   "lines": [
    {
     "zh": "载人航天，第一次尝试。一块木板，四根火箭，一位乘客。点火。",
     "en": "Crewed spaceflight, attempt one. One plank, four rockets, one passenger. Ignition.",
     "start": 139.153,
     "end": 144.286
    },
    {
     "zh": "很好，关节全断了。乘客没事，他自己说的。",
     "en": "Great, every joint snapped. The passenger is fine. He says so himself.",
     "start": 144.506,
     "end": 147.977
    },
    {
     "zh": "第二次，换成焊死的合并模式。三，二，一。",
     "en": "Attempt two, switched to welded merge mode. Three, two, one.",
     "start": 148.197,
     "end": 151.808
    },
    {
     "zh": "起飞了。再高一点，再高一点。",
     "en": "Liftoff. Higher. Higher.",
     "start": 152.028,
     "end": 154.32
    },
    {
     "zh": "海拉鲁上空，任务完成。",
     "en": "Above Hyrule. Mission complete.",
     "start": 154.54,
     "end": 156.422,
     "say": "海拉鲁上空，任务完成。"
    }
   ]
  },
  {
   "id": "outro",
   "kicker": "机制拆解 · 第 5 期",
   "title": "去发射吧",
   "start": 157.322,
   "voiceEnd": 165.343,
   "end": 168.343,
   "lines": [
    {
     "zh": "网页版在简介，你也可以去把自己送上天。点赞、收藏、关注，我私信把地址发你。",
     "en": "The web version is in the description; go launch yourself. Like, favorite and follow, and I'll DM you the address.",
     "start": 157.322,
     "end": 163.477
    },
    {
     "zh": "我是粑粑柑，下期见。",
     "en": "I'm Babagan. See you next time.",
     "start": 163.697,
     "end": 165.343
    }
   ]
  }
 ],
 "subs": [
  {
   "zh": "王国之泪的玩家",
   "en": "Tears of the Kingdom players have",
   "start": 0.6,
   "end": 1.81
  },
  {
   "zh": "早就用究极手把林克送上天好几回了",
   "en": "launched Link into the sky with Ultrahand more times than anyone can count.",
   "start": 1.81,
   "end": 4.576
  },
  {
   "zh": "那这玩意儿到底是怎么做出来的？",
   "en": "So how does this thing actually work?",
   "start": 4.796,
   "end": 6.91
  },
  {
   "zh": "任天堂没给代码，我只能自己写一个",
   "en": "Nintendo didn't share the code, so I wrote my own.",
   "start": 7.13,
   "end": 9.857
  },
  {
   "zh": "顺便定个小目标：在网页里",
   "en": "Small goal while I'm at it: a crewed",
   "start": 9.857,
   "end": 11.902
  },
  {
   "zh": "完成一次载人航天",
   "en": "spaceflight, in a web page.",
   "start": 11.902,
   "end": 13.265
  },
  {
   "zh": "网页版直接能玩，链接在简介。点赞",
   "en": "The web version is playable right now; link in the description.",
   "start": 14.165,
   "end": 17.027
  },
  {
   "zh": "收藏、关注之后，我把地址私信发你",
   "en": "Like, favorite and follow, and I'll DM you the address.",
   "start": 17.027,
   "end": 19.889
  },
  {
   "zh": "先看任天堂自己怎么说。GDC 2024 上",
   "en": "First, what Nintendo says. At GDC 2024, the game's",
   "start": 20.789,
   "end": 23.965
  },
  {
   "zh": "王国之泪的物理负责人讲了一条铁律：",
   "en": "physics lead laid down one iron rule:",
   "start": 23.965,
   "end": 26.535
  },
  {
   "zh": "世界里所有东西，都必须是刚体加约束",
   "en": "Everything in the world must be rigid bodies plus constraints.",
   "start": 26.755,
   "end": 29.818
  },
  {
   "zh": "没有例外",
   "en": "No exceptions.",
   "start": 29.818,
   "end": 30.539
  },
  {
   "zh": "以前很多机关是按动画硬推的",
   "en": "A lot of old contraptions were pushed by animation.",
   "start": 30.759,
   "end": 32.883
  },
  {
   "zh": "在物理引擎眼里，它们重得没有上限",
   "en": "To the physics engine, they're infinitely heavy.",
   "start": 32.883,
   "end": 35.498
  },
  {
   "zh": "结果就是：你塞块冰到闸门底下",
   "en": "So if you slide a block of ice under a gate,",
   "start": 35.718,
   "end": 38.147
  },
  {
   "zh": "闸门直接把冰按进地里，还在那抽搐",
   "en": "the gate shoves it into the floor and keeps twitching.",
   "start": 38.147,
   "end": 40.923
  },
  {
   "zh": "改成真物理以后，冰把闸门顶住了",
   "en": "With real physics, the ice holds the gate up,",
   "start": 41.143,
   "end": 43.693
  },
  {
   "zh": "还顺便多出来一种解法",
   "en": "and that even opened up a new solution.",
   "start": 43.693,
   "end": 45.393
  },
  {
   "zh": "好，规矩懂了。开工",
   "en": "Okay, rules understood. Let's build.",
   "start": 45.613,
   "end": 47.322
  },
  {
   "zh": "第一步，抓东西",
   "en": "Step one: grab. Fire a ray",
   "start": 48.222,
   "end": 49.536
  },
  {
   "zh": "从屏幕中间打一条射线，打中哪",
   "en": "from the middle of the screen; whatever it hits,",
   "start": 49.536,
   "end": 52.165
  },
  {
   "zh": "就抓哪",
   "en": "you hold.",
   "start": 52.165,
   "end": 52.728
  },
  {
   "zh": "新手写法，是每帧直接把它挪到你面前",
   "en": "The beginner way is to teleport it in front of you every frame.",
   "start": 52.948,
   "end": 56.049
  },
  {
   "zh": "效果嘛，穿墙，还顺手把箱子全挤飞",
   "en": "Result: it phases through walls and launches every crate.",
   "start": 56.049,
   "end": 58.968
  },
  {
   "zh": "正确写法，是给它一个速度",
   "en": "The right way is to give it a velocity and",
   "start": 59.188,
   "end": 61.269
  },
  {
   "zh": "让它自己飞过去。墙挡着就是挡着",
   "en": "let it fly there. If a wall's in the way, it stops.",
   "start": 61.269,
   "end": 63.87
  },
  {
   "zh": "这才叫物理",
   "en": "That's physics.",
   "start": 63.87,
   "end": 64.737
  },
  {
   "zh": "第二步，转。一下四十五度，转完对齐",
   "en": "Step two: rotate. Forty-five degrees a press, then snap.",
   "start": 65.637,
   "end": 68.474
  },
  {
   "zh": "不然你这辈子都摆不正一块木板",
   "en": "Otherwise you'll never get a plank straight.",
   "start": 68.474,
   "end": 70.81
  },
  {
   "zh": "第三步，找粘哪儿。举着东西的时候",
   "en": "Step three: where to glue. While you're holding something,",
   "start": 71.71,
   "end": 74.544
  },
  {
   "zh": "每一帧都在算：离我最近的是谁",
   "en": "every frame asks: who's closest,",
   "start": 74.544,
   "end": 77.025
  },
  {
   "zh": "差多远",
   "en": "and how far?",
   "start": 77.025,
   "end": 77.556
  },
  {
   "zh": "够近了，就拉出这根线，意思是：",
   "en": "Close enough, and this line appears. It means:",
   "start": 77.776,
   "end": 80.37
  },
  {
   "zh": "松手就粘这儿",
   "en": "let go and it sticks here.",
   "start": 80.37,
   "end": 81.407
  },
  {
   "zh": "第四步，粘。这里有个岔路口",
   "en": "Step four: glue. Here the road forks.",
   "start": 82.307,
   "end": 84.626
  },
  {
   "zh": "要么两块还是两块，中间加个关节拉着",
   "en": "Either they stay two pieces with a joint holding them,",
   "start": 84.846,
   "end": 87.649
  },
  {
   "zh": "要么干脆焊成一整块",
   "en": "or you weld them into one solid thing.",
   "start": 87.649,
   "end": 89.133
  },
  {
   "zh": "拿座桥试试，砸块石头",
   "en": "Let's test a bridge and drop a rock.",
   "start": 89.353,
   "end": 91.203
  },
  {
   "zh": "关节版会弯会晃，焊死的那版纹丝不动",
   "en": "The joint version bends and wobbles; the welded one doesn't budge.",
   "start": 91.203,
   "end": 94.347
  },
  {
   "zh": "游戏里用的哪种？任天堂没说",
   "en": "Which one does the game use? Nintendo never said.",
   "start": 94.567,
   "end": 96.77
  },
  {
   "zh": "我猜是关节，因为大家造的车都在晃",
   "en": "My guess is joints, because everyone's cars wobble.",
   "start": 96.77,
   "end": 99.483
  },
  {
   "zh": "第五步，搬。抓住一块",
   "en": "Step five: carry. Grab one piece and the",
   "start": 100.383,
   "end": 102.294
  },
  {
   "zh": "整坨都得跟着走",
   "en": "whole build has to come along.",
   "start": 102.294,
   "end": 103.632
  },
  {
   "zh": "要是只拽一块，后面全靠关节拖着",
   "en": "Drag just one piece and the rest hangs off the joints. Make it",
   "start": 103.852,
   "end": 106.533
  },
  {
   "zh": "长了就成了面条",
   "en": "long and you've got noodles.",
   "start": 106.533,
   "end": 107.784
  },
  {
   "zh": "所以每一块都朝同一个目标一起动",
   "en": "So every piece moves toward the same target together,",
   "start": 108.004,
   "end": 110.398
  },
  {
   "zh": "就稳了",
   "en": "and it holds.",
   "start": 110.398,
   "end": 110.877
  },
  {
   "zh": "还有",
   "en": "Also,",
   "start": 111.097,
   "end": 111.459
  },
  {
   "zh": "玩家测出来一次最多粘二十一个零件",
   "en": "players found you can glue at most 21 parts.",
   "start": 111.459,
   "end": 114.36
  },
  {
   "zh": "为什么是二十一？任天堂没解释",
   "en": "Why 21? Nintendo never explained.",
   "start": 114.36,
   "end": 116.898
  },
  {
   "zh": "我猜跟这个有关：零件越多，越难算",
   "en": "My guess: more parts, harder math. Let the engine",
   "start": 117.118,
   "end": 120.044
  },
  {
   "zh": "物理引擎只算一遍是面条",
   "en": "iterate once and it's a noodle;",
   "start": 120.044,
   "end": 122.055
  },
  {
   "zh": "算八遍才站得直",
   "en": "eight times and it stands up.",
   "start": 122.055,
   "end": 123.336
  },
  {
   "zh": "第六步，上动力。风扇很简单",
   "en": "Step six: power. A fan is simple:",
   "start": 124.236,
   "end": 126.523
  },
  {
   "zh": "就是一直在它屁股后面推",
   "en": "it just keeps pushing from behind.",
   "start": 126.523,
   "end": 128.458
  },
  {
   "zh": "轮子得能转，所以只能用转轴连着",
   "en": "A wheel has to spin, so it hangs on an axle joint",
   "start": 128.678,
   "end": 131.282
  },
  {
   "zh": "再加个马达去拧",
   "en": "with a motor turning it.",
   "start": 131.282,
   "end": 132.498
  },
  {
   "zh": "任天堂说，游戏里压根没有车辆程序",
   "en": "Nintendo says there's no vehicle code at all.",
   "start": 132.718,
   "end": 135.486
  },
  {
   "zh": "车，就是轮子加木板，自己凑出来的",
   "en": "A car is just wheels and planks that happen to add up.",
   "start": 135.486,
   "end": 138.253
  },
  {
   "zh": "载人航天，第一次尝试。一块木板",
   "en": "Crewed spaceflight, attempt one. One plank,",
   "start": 139.153,
   "end": 142.005
  },
  {
   "zh": "四根火箭，一位乘客。点火",
   "en": "four rockets, one passenger. Ignition.",
   "start": 142.005,
   "end": 144.286
  },
  {
   "zh": "很好，关节全断了。乘客没事",
   "en": "Great, every joint snapped. The passenger is fine.",
   "start": 144.506,
   "end": 147.013
  },
  {
   "zh": "他自己说的",
   "en": "He says so himself.",
   "start": 147.013,
   "end": 147.977
  },
  {
   "zh": "第二次，换成焊死的合并模式。三，二，一",
   "en": "Attempt two, switched to welded merge mode. Three, two, one.",
   "start": 148.197,
   "end": 151.808
  },
  {
   "zh": "起飞了。再高一点，再高一点",
   "en": "Liftoff. Higher. Higher.",
   "start": 152.028,
   "end": 154.32
  },
  {
   "zh": "海拉鲁上空，任务完成",
   "en": "Above Hyrule. Mission complete.",
   "start": 154.54,
   "end": 156.422
  },
  {
   "zh": "网页版在简介",
   "en": "The web version is",
   "start": 157.322,
   "end": 158.408
  },
  {
   "zh": "你也可以去把自己送上天。点赞、收藏",
   "en": "in the description; go launch yourself. Like, favorite and",
   "start": 158.408,
   "end": 161.486
  },
  {
   "zh": "关注，我私信把地址发你",
   "en": "follow, and I'll DM you the address.",
   "start": 161.486,
   "end": 163.477
  },
  {
   "zh": "我是粑粑柑，下期见",
   "en": "I'm Babagan. See you next time.",
   "start": 163.697,
   "end": 165.343
  }
 ]
};
