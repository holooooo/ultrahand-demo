window.TIMELINE = {
 "duration": 188.912,
 "scenes": [
  {
   "id": "hook",
   "kicker": "机制拆解 · 第 5 期",
   "title": "载人航天",
   "start": 0.0,
   "voiceEnd": 20.337,
   "end": 21.237,
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
    },
    {
     "zh": "剧透一下：第一次发射，炸了。",
     "en": "Spoiler: the first launch blew up.",
     "start": 13.485,
     "end": 15.758
    },
    {
     "zh": "代码是我让 Claude Opus 写的，我负责提需求，和按发射按钮。",
     "en": "Claude Opus wrote the code. I wrote the requests, and pressed the launch button.",
     "start": 15.978,
     "end": 20.337,
     "say": "代码是我让 克劳德欧帕斯 写的，我负责提需求，和按发射按钮。"
    }
   ]
  },
  {
   "id": "repo",
   "kicker": "先说福利",
   "title": "能玩 · 有源码",
   "start": 21.237,
   "voiceEnd": 27.544,
   "end": 28.444,
   "lines": [
    {
     "zh": "网页版直接能玩，链接在简介。源码单独放了个仓库，三连加评论，我私信发你。",
     "en": "The web version is playable now, link in the description. Source is in its own repo: like, coin, favorite, comment, and I'll DM it to you.",
     "start": 21.237,
     "end": 27.544
    }
   ]
  },
  {
   "id": "gdc",
   "kicker": "00 · 任天堂的规矩",
   "title": "全都得是物理",
   "start": 28.444,
   "voiceEnd": 54.977,
   "end": 55.877,
   "lines": [
    {
     "zh": "先看任天堂自己怎么说。GDC 2024 上，王国之泪的物理负责人讲了一条铁律：",
     "en": "First, what Nintendo says. At GDC 2024, the game's physics lead laid down one iron rule:",
     "start": 28.444,
     "end": 34.19,
     "say": "先看任天堂自己怎么说。G D C 二零二四 上，王国之泪的物理负责人讲了一条铁律："
    },
    {
     "zh": "世界里所有东西，都必须是刚体加约束。没有例外。",
     "en": "Everything in the world must be rigid bodies plus constraints. No exceptions.",
     "start": 34.41,
     "end": 38.194
    },
    {
     "zh": "以前很多机关是按动画硬推的。在物理引擎眼里，它们重得没有上限。",
     "en": "A lot of old contraptions were pushed by animation. To the physics engine, they're infinitely heavy.",
     "start": 38.414,
     "end": 43.153
    },
    {
     "zh": "结果就是：你塞块冰到闸门底下，闸门直接把冰按进地里，还在那抽搐。",
     "en": "So if you slide a block of ice under a gate, the gate shoves it into the floor and keeps twitching.",
     "start": 43.373,
     "end": 48.579
    },
    {
     "zh": "改成真物理以后，冰把闸门顶住了，还顺便多出来一种解法。",
     "en": "With real physics, the ice holds the gate up, and that even opened up a new solution.",
     "start": 48.799,
     "end": 53.048
    },
    {
     "zh": "好，规矩懂了。开工。",
     "en": "Okay, rules understood. Let's build.",
     "start": 53.268,
     "end": 54.977
    }
   ]
  },
  {
   "id": "grab",
   "kicker": "01 · 抓",
   "title": "别瞬移",
   "start": 55.877,
   "voiceEnd": 72.392,
   "end": 73.292,
   "lines": [
    {
     "zh": "第一步，抓东西。从屏幕中间打一条射线，打中哪，就抓哪。",
     "en": "Step one: grab. Fire a ray from the middle of the screen; whatever it hits, you hold.",
     "start": 55.877,
     "end": 60.383
    },
    {
     "zh": "新手写法，是每帧直接把它挪到你面前。效果嘛，穿墙，还顺手把箱子全挤飞。",
     "en": "The beginner way is to teleport it in front of you every frame. Result: it phases through walls and launches every crate.",
     "start": 60.603,
     "end": 66.623
    },
    {
     "zh": "正确写法，是给它一个速度，让它自己飞过去。墙挡着就是挡着，这才叫物理。",
     "en": "The right way is to give it a velocity and let it fly there. If a wall's in the way, it stops. That's physics.",
     "start": 66.843,
     "end": 72.392
    }
   ]
  },
  {
   "id": "rotate",
   "kicker": "02 · 转",
   "title": "四十五度",
   "start": 73.292,
   "voiceEnd": 78.465,
   "end": 79.365,
   "lines": [
    {
     "zh": "第二步，转。一下四十五度，转完对齐。不然你这辈子都摆不正一块木板。",
     "en": "Step two: rotate. Forty-five degrees a press, then snap. Otherwise you'll never get a plank straight.",
     "start": 73.292,
     "end": 78.465
    }
   ]
  },
  {
   "id": "find",
   "kicker": "03 · 找点",
   "title": "粘哪儿",
   "start": 79.365,
   "voiceEnd": 89.063,
   "end": 89.963,
   "lines": [
    {
     "zh": "第三步，找粘哪儿。举着东西的时候，每一帧都在算：离我最近的是谁，差多远。",
     "en": "Step three: where to glue. While you're holding something, every frame asks: who's closest, and how far?",
     "start": 79.365,
     "end": 85.211
    },
    {
     "zh": "够近了，就拉出这根线，意思是：松手就粘这儿。",
     "en": "Close enough, and this line appears. It means: let go and it sticks here.",
     "start": 85.431,
     "end": 89.063
    }
   ]
  },
  {
   "id": "glue",
   "kicker": "04 · 粘",
   "title": "关节还是焊死",
   "start": 89.963,
   "voiceEnd": 107.138,
   "end": 108.038,
   "lines": [
    {
     "zh": "第四步，粘。这里有个岔路口。",
     "en": "Step four: glue. Here the road forks.",
     "start": 89.963,
     "end": 92.281
    },
    {
     "zh": "要么两块还是两块，中间加个关节拉着；要么干脆焊成一整块。",
     "en": "Either they stay two pieces with a joint holding them, or you weld them into one solid thing.",
     "start": 92.501,
     "end": 96.788
    },
    {
     "zh": "拿座桥试试，砸块石头。关节版会弯会晃，焊死的那版纹丝不动。",
     "en": "Let's test a bridge and drop a rock. The joint version bends and wobbles; the welded one doesn't budge.",
     "start": 97.008,
     "end": 102.002
    },
    {
     "zh": "游戏里用的哪种？任天堂没说。我猜是关节，因为大家造的车都在晃。",
     "en": "Which one does the game use? Nintendo never said. My guess is joints, because everyone's cars wobble.",
     "start": 102.222,
     "end": 107.138
    }
   ]
  },
  {
   "id": "carry",
   "kicker": "05 · 搬",
   "title": "整坨一起走",
   "start": 108.038,
   "voiceEnd": 130.991,
   "end": 131.891,
   "lines": [
    {
     "zh": "第五步，搬。抓住一块，整坨都得跟着走。",
     "en": "Step five: carry. Grab one piece and the whole build has to come along.",
     "start": 108.038,
     "end": 111.287
    },
    {
     "zh": "要是只拽一块，后面全靠关节拖着，长了就成了面条。",
     "en": "Drag just one piece and the rest hangs off the joints. Make it long and you've got noodles.",
     "start": 111.507,
     "end": 115.439
    },
    {
     "zh": "所以每一块都朝同一个目标一起动，就稳了。",
     "en": "So every piece moves toward the same target together, and it holds.",
     "start": 115.659,
     "end": 118.532
    },
    {
     "zh": "还有，玩家测出来一次最多粘二十一个零件。为什么是二十一？任天堂没解释。",
     "en": "Also, players found you can glue at most 21 parts. Why 21? Nintendo never explained.",
     "start": 118.752,
     "end": 124.553
    },
    {
     "zh": "我猜跟这个有关：零件越多，越难算。物理引擎只算一遍是面条，算八遍才站得直。",
     "en": "My guess: more parts, harder math. Let the engine iterate once and it's a noodle; eight times and it stands up.",
     "start": 124.773,
     "end": 130.991
    }
   ]
  },
  {
   "id": "power",
   "kicker": "06 · 动力",
   "title": "没有车辆程序",
   "start": 131.891,
   "voiceEnd": 145.908,
   "end": 146.808,
   "lines": [
    {
     "zh": "第六步，上动力。风扇很简单，就是一直在它屁股后面推。",
     "en": "Step six: power. A fan is simple: it just keeps pushing from behind.",
     "start": 131.891,
     "end": 136.113
    },
    {
     "zh": "轮子得能转，所以只能用转轴连着，再加个马达去拧。",
     "en": "A wheel has to spin, so it hangs on an axle joint with a motor turning it.",
     "start": 136.333,
     "end": 140.153
    },
    {
     "zh": "任天堂说，游戏里压根没有车辆程序。车，就是轮子加木板，自己凑出来的。",
     "en": "Nintendo says there's no vehicle code at all. A car is just wheels and planks that happen to add up.",
     "start": 140.373,
     "end": 145.908
    }
   ]
  },
  {
   "id": "besiege",
   "kicker": "07 · 围攻",
   "title": "会散架",
   "start": 146.808,
   "voiceEnd": 156.38,
   "end": 157.28,
   "lines": [
    {
     "zh": "顺便提一嘴围攻。它是先搭好再开跑，关节受力太大就断，散架本身就是玩法。",
     "en": "Quick word on Besiege. You build first and run later; overload a joint and it snaps. Falling apart is the gameplay.",
     "start": 146.808,
     "end": 152.419
    },
    {
     "zh": "我也加了个围攻模式。然后，终于到了今天的主线任务。",
     "en": "I added a Besiege mode too. Which brings us, finally, to today's main mission.",
     "start": 152.639,
     "end": 156.38
    }
   ]
  },
  {
   "id": "launch",
   "kicker": "08 · 载人航天",
   "title": "三，二，一",
   "start": 157.28,
   "voiceEnd": 175.392,
   "end": 176.292,
   "lines": [
    {
     "zh": "载人航天，第一次尝试。一块木板，四根火箭，一位乘客。围攻模式，点火。",
     "en": "Crewed spaceflight, attempt one. One plank, four rockets, one passenger. Besiege mode. Ignition.",
     "start": 157.28,
     "end": 163.257
    },
    {
     "zh": "很好，关节全断了。乘客没事，他自己说的。",
     "en": "Great, every joint snapped. The passenger is fine. He says so himself.",
     "start": 163.477,
     "end": 166.947
    },
    {
     "zh": "第二次，换成焊死的合并模式。三，二，一。",
     "en": "Attempt two, switched to welded merge mode. Three, two, one.",
     "start": 167.167,
     "end": 170.778
    },
    {
     "zh": "起飞了。再高一点，再高一点。",
     "en": "Liftoff. Higher. Higher.",
     "start": 170.998,
     "end": 173.29
    },
    {
     "zh": "海拉鲁上空，任务完成。",
     "en": "Above Hyrule. Mission complete.",
     "start": 173.51,
     "end": 175.392,
     "say": "海拉鲁上空，任务完成。"
    }
   ]
  },
  {
   "id": "outro",
   "kicker": "机制拆解 · 第 5 期",
   "title": "去发射吧",
   "start": 176.292,
   "voiceEnd": 185.912,
   "end": 188.912,
   "lines": [
    {
     "zh": "网页版在简介，你也可以去把自己送上天。源码，三连加评论，私信领。",
     "en": "The web version is in the description; go launch yourself. For the source: like, coin, favorite, comment, and I'll DM you.",
     "start": 176.292,
     "end": 181.658
    },
    {
     "zh": "代码是 Opus 写的，锅是我背的。我是粑粑柑，下期见。",
     "en": "Opus wrote the code; I take the blame. I'm Babagan. See you next time.",
     "start": 181.878,
     "end": 185.912,
     "say": "代码是 欧帕斯 写的，锅是我背的。我是粑粑柑，下期见。"
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
   "zh": "剧透一下：第一次发射，炸了",
   "en": "Spoiler: the first launch blew up.",
   "start": 13.485,
   "end": 15.758
  },
  {
   "zh": "代码是我让 Claude Opus 写的",
   "en": "Claude Opus wrote the code. I wrote the requests,",
   "start": 15.978,
   "end": 18.62
  },
  {
   "zh": "我负责提需求，和按发射按钮",
   "en": "and pressed the launch button.",
   "start": 18.62,
   "end": 20.337
  },
  {
   "zh": "网页版直接能玩，链接在简介",
   "en": "The web version is playable now, link in the description.",
   "start": 21.237,
   "end": 23.722
  },
  {
   "zh": "源码单独放了个仓库，三连加评论",
   "en": "Source is in its own repo: like, coin, favorite, comment,",
   "start": 23.722,
   "end": 26.589
  },
  {
   "zh": "我私信发你",
   "en": "and I'll DM it to you.",
   "start": 26.589,
   "end": 27.544
  },
  {
   "zh": "先看任天堂自己怎么说。GDC 2024 上",
   "en": "First, what Nintendo says. At GDC 2024, the game's",
   "start": 28.444,
   "end": 31.62
  },
  {
   "zh": "王国之泪的物理负责人讲了一条铁律：",
   "en": "physics lead laid down one iron rule:",
   "start": 31.62,
   "end": 34.19
  },
  {
   "zh": "世界里所有东西，都必须是刚体加约束",
   "en": "Everything in the world must be rigid bodies plus constraints.",
   "start": 34.41,
   "end": 37.473
  },
  {
   "zh": "没有例外",
   "en": "No exceptions.",
   "start": 37.473,
   "end": 38.194
  },
  {
   "zh": "以前很多机关是按动画硬推的",
   "en": "A lot of old contraptions were pushed by animation.",
   "start": 38.414,
   "end": 40.538
  },
  {
   "zh": "在物理引擎眼里，它们重得没有上限",
   "en": "To the physics engine, they're infinitely heavy.",
   "start": 40.538,
   "end": 43.153
  },
  {
   "zh": "结果就是：你塞块冰到闸门底下",
   "en": "So if you slide a block of ice under a gate,",
   "start": 43.373,
   "end": 45.802
  },
  {
   "zh": "闸门直接把冰按进地里，还在那抽搐",
   "en": "the gate shoves it into the floor and keeps twitching.",
   "start": 45.802,
   "end": 48.579
  },
  {
   "zh": "改成真物理以后，冰把闸门顶住了",
   "en": "With real physics, the ice holds the gate up,",
   "start": 48.799,
   "end": 51.348
  },
  {
   "zh": "还顺便多出来一种解法",
   "en": "and that even opened up a new solution.",
   "start": 51.348,
   "end": 53.048
  },
  {
   "zh": "好，规矩懂了。开工",
   "en": "Okay, rules understood. Let's build.",
   "start": 53.268,
   "end": 54.977
  },
  {
   "zh": "第一步，抓东西",
   "en": "Step one: grab. Fire a ray",
   "start": 55.877,
   "end": 57.192
  },
  {
   "zh": "从屏幕中间打一条射线，打中哪",
   "en": "from the middle of the screen; whatever it hits,",
   "start": 57.192,
   "end": 59.82
  },
  {
   "zh": "就抓哪",
   "en": "you hold.",
   "start": 59.82,
   "end": 60.383
  },
  {
   "zh": "新手写法，是每帧直接把它挪到你面前",
   "en": "The beginner way is to teleport it in front of you every frame.",
   "start": 60.603,
   "end": 63.704
  },
  {
   "zh": "效果嘛，穿墙，还顺手把箱子全挤飞",
   "en": "Result: it phases through walls and launches every crate.",
   "start": 63.704,
   "end": 66.623
  },
  {
   "zh": "正确写法，是给它一个速度",
   "en": "The right way is to give it a velocity and",
   "start": 66.843,
   "end": 68.924
  },
  {
   "zh": "让它自己飞过去。墙挡着就是挡着",
   "en": "let it fly there. If a wall's in the way, it stops.",
   "start": 68.924,
   "end": 71.525
  },
  {
   "zh": "这才叫物理",
   "en": "That's physics.",
   "start": 71.525,
   "end": 72.392
  },
  {
   "zh": "第二步，转。一下四十五度，转完对齐",
   "en": "Step two: rotate. Forty-five degrees a press, then snap.",
   "start": 73.292,
   "end": 76.129
  },
  {
   "zh": "不然你这辈子都摆不正一块木板",
   "en": "Otherwise you'll never get a plank straight.",
   "start": 76.129,
   "end": 78.465
  },
  {
   "zh": "第三步，找粘哪儿。举着东西的时候",
   "en": "Step three: where to glue. While you're holding something,",
   "start": 79.365,
   "end": 82.199
  },
  {
   "zh": "每一帧都在算：离我最近的是谁",
   "en": "every frame asks: who's closest,",
   "start": 82.199,
   "end": 84.68
  },
  {
   "zh": "差多远",
   "en": "and how far?",
   "start": 84.68,
   "end": 85.211
  },
  {
   "zh": "够近了，就拉出这根线，意思是：",
   "en": "Close enough, and this line appears. It means:",
   "start": 85.431,
   "end": 88.025
  },
  {
   "zh": "松手就粘这儿",
   "en": "let go and it sticks here.",
   "start": 88.025,
   "end": 89.063
  },
  {
   "zh": "第四步，粘。这里有个岔路口",
   "en": "Step four: glue. Here the road forks.",
   "start": 89.963,
   "end": 92.281
  },
  {
   "zh": "要么两块还是两块，中间加个关节拉着",
   "en": "Either they stay two pieces with a joint holding them,",
   "start": 92.501,
   "end": 95.304
  },
  {
   "zh": "要么干脆焊成一整块",
   "en": "or you weld them into one solid thing.",
   "start": 95.304,
   "end": 96.788
  },
  {
   "zh": "拿座桥试试，砸块石头",
   "en": "Let's test a bridge and drop a rock.",
   "start": 97.008,
   "end": 98.858
  },
  {
   "zh": "关节版会弯会晃，焊死的那版纹丝不动",
   "en": "The joint version bends and wobbles; the welded one doesn't budge.",
   "start": 98.858,
   "end": 102.002
  },
  {
   "zh": "游戏里用的哪种？任天堂没说",
   "en": "Which one does the game use? Nintendo never said.",
   "start": 102.222,
   "end": 104.426
  },
  {
   "zh": "我猜是关节，因为大家造的车都在晃",
   "en": "My guess is joints, because everyone's cars wobble.",
   "start": 104.426,
   "end": 107.138
  },
  {
   "zh": "第五步，搬。抓住一块",
   "en": "Step five: carry. Grab one piece and the",
   "start": 108.038,
   "end": 109.949
  },
  {
   "zh": "整坨都得跟着走",
   "en": "whole build has to come along.",
   "start": 109.949,
   "end": 111.287
  },
  {
   "zh": "要是只拽一块，后面全靠关节拖着",
   "en": "Drag just one piece and the rest hangs off the joints. Make it",
   "start": 111.507,
   "end": 114.188
  },
  {
   "zh": "长了就成了面条",
   "en": "long and you've got noodles.",
   "start": 114.188,
   "end": 115.439
  },
  {
   "zh": "所以每一块都朝同一个目标一起动",
   "en": "So every piece moves toward the same target together,",
   "start": 115.659,
   "end": 118.053
  },
  {
   "zh": "就稳了",
   "en": "and it holds.",
   "start": 118.053,
   "end": 118.532
  },
  {
   "zh": "还有",
   "en": "Also,",
   "start": 118.752,
   "end": 119.114
  },
  {
   "zh": "玩家测出来一次最多粘二十一个零件",
   "en": "players found you can glue at most 21 parts.",
   "start": 119.114,
   "end": 122.015
  },
  {
   "zh": "为什么是二十一？任天堂没解释",
   "en": "Why 21? Nintendo never explained.",
   "start": 122.015,
   "end": 124.553
  },
  {
   "zh": "我猜跟这个有关：零件越多，越难算",
   "en": "My guess: more parts, harder math. Let the engine",
   "start": 124.773,
   "end": 127.699
  },
  {
   "zh": "物理引擎只算一遍是面条",
   "en": "iterate once and it's a noodle;",
   "start": 127.699,
   "end": 129.711
  },
  {
   "zh": "算八遍才站得直",
   "en": "eight times and it stands up.",
   "start": 129.711,
   "end": 130.991
  },
  {
   "zh": "第六步，上动力。风扇很简单",
   "en": "Step six: power. A fan is simple:",
   "start": 131.891,
   "end": 134.178
  },
  {
   "zh": "就是一直在它屁股后面推",
   "en": "it just keeps pushing from behind.",
   "start": 134.178,
   "end": 136.113
  },
  {
   "zh": "轮子得能转，所以只能用转轴连着",
   "en": "A wheel has to spin, so it hangs on an axle joint",
   "start": 136.333,
   "end": 138.938
  },
  {
   "zh": "再加个马达去拧",
   "en": "with a motor turning it.",
   "start": 138.938,
   "end": 140.153
  },
  {
   "zh": "任天堂说，游戏里压根没有车辆程序",
   "en": "Nintendo says there's no vehicle code at all.",
   "start": 140.373,
   "end": 143.141
  },
  {
   "zh": "车，就是轮子加木板，自己凑出来的",
   "en": "A car is just wheels and planks that happen to add up.",
   "start": 143.141,
   "end": 145.908
  },
  {
   "zh": "顺便提一嘴围攻。它是先搭好再开跑",
   "en": "Quick word on Besiege. You build first and run later;",
   "start": 146.808,
   "end": 149.529
  },
  {
   "zh": "关节受力太大就断，散架本身就是玩法",
   "en": "overload a joint and it snaps. Falling apart is the gameplay.",
   "start": 149.529,
   "end": 152.419
  },
  {
   "zh": "我也加了个围攻模式。然后",
   "en": "I added a Besiege mode too. Which brings us,",
   "start": 152.639,
   "end": 154.591
  },
  {
   "zh": "终于到了今天的主线任务",
   "en": "finally, to today's main mission.",
   "start": 154.591,
   "end": 156.38
  },
  {
   "zh": "载人航天，第一次尝试。一块木板",
   "en": "Crewed spaceflight, attempt one. One plank,",
   "start": 157.28,
   "end": 160.081
  },
  {
   "zh": "四根火箭，一位乘客。围攻模式，点火",
   "en": "four rockets, one passenger. Besiege mode. Ignition.",
   "start": 160.081,
   "end": 163.257
  },
  {
   "zh": "很好，关节全断了。乘客没事",
   "en": "Great, every joint snapped. The passenger is fine.",
   "start": 163.477,
   "end": 165.983
  },
  {
   "zh": "他自己说的",
   "en": "He says so himself.",
   "start": 165.983,
   "end": 166.947
  },
  {
   "zh": "第二次，换成焊死的合并模式。三，二，一",
   "en": "Attempt two, switched to welded merge mode. Three, two, one.",
   "start": 167.167,
   "end": 170.778
  },
  {
   "zh": "起飞了。再高一点，再高一点",
   "en": "Liftoff. Higher. Higher.",
   "start": 170.998,
   "end": 173.29
  },
  {
   "zh": "海拉鲁上空，任务完成",
   "en": "Above Hyrule. Mission complete.",
   "start": 173.51,
   "end": 175.392
  },
  {
   "zh": "网页版在简介",
   "en": "The web version is in the",
   "start": 176.292,
   "end": 177.402
  },
  {
   "zh": "你也可以去把自己送上天。源码",
   "en": "description; go launch yourself. For the source: like, coin,",
   "start": 177.402,
   "end": 179.993
  },
  {
   "zh": "三连加评论，私信领",
   "en": "favorite, comment, and I'll DM you.",
   "start": 179.993,
   "end": 181.658
  },
  {
   "zh": "代码是 Opus 写的，锅是我背的",
   "en": "Opus wrote the code; I take the blame. I'm Babagan.",
   "start": 181.878,
   "end": 184.516
  },
  {
   "zh": "我是粑粑柑，下期见",
   "en": "See you next time.",
   "start": 184.516,
   "end": 185.912
  }
 ]
};
