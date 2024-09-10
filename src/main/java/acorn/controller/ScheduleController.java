package acorn.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import acorn.entity.Game;
import acorn.entity.Injury;
import acorn.entity.Train;
import acorn.service.GameService;
import acorn.service.InjuryService;
import acorn.service.TrainService;

@RestController
@RequestMapping("/schedule")
public class ScheduleController {

    private final InjuryService injuryService;
    private final TrainService trainService;
    private final GameService gameService;

    public ScheduleController(InjuryService injuryService, TrainService trainService, GameService gameService) {
        this.injuryService = injuryService;
        this.trainService = trainService;
        this.gameService = gameService;
    }

    // 일정 조회 (부상, 훈련 및 경기 리스트)
    @GetMapping("/list")
    public Map<String, List<?>> getScheduleList() {
        List<Injury> injuries = injuryService.getAllInjuries();
        List<Train> trainings = trainService.getAllTrains();
        List<Game> games = gameService.getAllGames();

        Map<String, List<?>> scheduleMap = new HashMap<>();
        scheduleMap.put("injuries", injuries);
        scheduleMap.put("trainings", trainings);
        scheduleMap.put("games", games);

        return scheduleMap;
    }
}
