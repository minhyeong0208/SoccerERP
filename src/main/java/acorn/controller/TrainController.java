package acorn.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import acorn.entity.Train;
import acorn.service.TrainService;

@RestController
@RequestMapping("/trains")
public class TrainController {

    private final TrainService trainService;

    @Autowired
    public TrainController(TrainService trainService) {
        this.trainService = trainService;
    }

    // 모든 훈련 조회 (페이징 처리)
    @GetMapping
    public Page<Train> getAllTrains(Pageable pageable) {
        return trainService.getAllTrains(pageable);
    }
    
    // 특정 훈련 조회
    @GetMapping("/{id}")
    public ResponseEntity<Train> getTrainById(@PathVariable(value = "id") int trainIdx) {
        Train train = trainService.getTrainById(trainIdx);
        if (train == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(train);
    }

    // 새로운 훈련 추가
    @PostMapping
    public Train createTrain(@RequestBody Train train) {
        return trainService.addTrain(train);
    }

    // 훈련 업데이트
    @PutMapping("/{id}")
    public ResponseEntity<Train> updateTrain(
            @PathVariable(value = "id") int trainIdx, @RequestBody Train trainDetails) {
        Train updatedTrain = trainService.updateTrain(trainIdx, trainDetails);
        if (updatedTrain == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updatedTrain);
    }

    // 훈련 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrain(@PathVariable(value = "id") int trainIdx) {
        trainService.deleteTrain(trainIdx);
        return ResponseEntity.ok().build();
    }
}
