const fs = require('fs');
const readline = require('readline');

const utils = require('./utils');
const { inputs } = require('./cli_input.json');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let input = [];

process.stdout.write(inputs[0]);

rl.on('line', line => {
    input.push(line);
    if(input.length < inputs.length) process.stdout.write(inputs[input.length]);
    else rl.close();
}).on('close', () => {
    if(input.length < inputs.length) {
        console.log('\n\n변환을 취소합니다.');
        process.exit(0);
    }

    if(![ 'l' , 'r' ].includes(input[5])) {
        console.log('\n\n길의 진행 방향이 잘못되었습니다!');
        process.exit(0);
    }

    input = input.map(a => isNaN(a) ? a : Number(a));

    const file = fs.readFileSync(input[0]);
    fs.writeFileSync('./triangle_backup.adofai', file);

    const level = utils.ADOFAIParser(file);

    const open_triangle_position = input[1] - input[3];

    // 삼각형 펴는 효과
    for(let t = 3; t < input[2] * 3; t++) {
        const triangle_number = Math.ceil((t + 1) / 3) - 1;

        let position;
        switch((t + 1) % 3) {
            case 1:
                position = [ triangle_number * 0.55 * (input[5] == 'l' ? -1 : 1) , triangle_number * -0.55 ];
                break;
            case 2:
                position = [ 0 , triangle_number * 0.65 ];
                break;
            case 0:
                position = [ triangle_number * 0.55 * (input[5] == 'l' ? 1 : -1) , triangle_number * -0.55 ];
                break;
        }

        level.actions.push({
            "floor": open_triangle_position,
            "eventType": "MoveTrack",
            "startTile": [input[3] + t, "ThisTile"],
            "endTile": [input[3] + t, "ThisTile"],
            "duration": input[4],
            "positionOffset": position,
            "rotationOffset": 0,
            "scale": 100,
            "opacity": 100,
            "angleOffset": 0,
            "ease": "OutBack",
            "eventTag": ""
        });
    }

    // 삼각형 들어가는 효과, 삼각형 없애는 효과
    for(let t = 0; t < input[2] - 1; t++) {
        level.actions.push({
            "floor": input[1] + (t * 3) + 1,
            "eventType": "MoveTrack",
            "startTile": [2, "ThisTile"],
            "endTile": [4, "ThisTile"],
            "duration": 0.65,
            "positionOffset": [0, 0],
            "rotationOffset": 0,
            "scale": 100,
            "opacity": 100,
            "angleOffset": 0,
            "ease": "InBack",
            "eventTag": ""
        });

        level.actions.push({
            "floor": input[1] + (t * 3) + 3,
            "eventType": "MoveTrack",
            "startTile": [0, "ThisTile"],
            "endTile": [2, "ThisTile"],
            "duration": 0,
            "positionOffset": [0, 0],
            "rotationOffset": 0,
            "scale": 100,
            "opacity": 0,
            "angleOffset": 0,
            "ease": "Linear",
            "eventTag": ""
        });
    }

    // 다음 삼각형을 끌어오는 효과
    for(let triangle_count = 0; triangle_count <= input[2]; triangle_count++) {
        for(let t = 0; t < ((input[2] - triangle_count) * 3) - 6; t++) {
            const triangle_number = Math.ceil((t + 1) / 3);

            let position;
            switch((t + 1) % 3) {
                case 1:
                    position = [ triangle_number * 0.55 * (input[5] == 'l' ? -1 : 1) , triangle_number * -0.55 ];
                    break;
                case 2:
                    position = [ 0 , triangle_number * 0.65 ];
                    break;
                case 0:
                    position = [ triangle_number * 0.55 * (input[5] == 'l' ? 1 : -1) , triangle_number * -0.55 ];
                    break;
            }

            level.actions.push({
                "floor": input[1] + (triangle_count * 3) + 1,
                "eventType": "MoveTrack",
                "startTile": [5 + t, "ThisTile"],
                "endTile": [5 + t, "ThisTile"],
                "duration": 0.65,
                "positionOffset": position,
                "rotationOffset": 0,
                "scale": 100,
                "opacity": 100,
                "angleOffset": 0,
                "ease": "InBack",
                "eventTag": ""
            });
        }
    }

    fs.writeFileSync(input[0], JSON.stringify(level, null, 2));
});