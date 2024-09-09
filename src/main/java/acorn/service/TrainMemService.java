package acorn.service;

import java.util.List;

import org.springframework.stereotype.Service;

import acorn.entity.Person;
import acorn.entity.Train;
import acorn.entity.TrainMem;
import acorn.repository.TrainMemRepository;

@Service
public class TrainMemService {

    private final TrainMemRepository trainMemRepository;

    public TrainMemService(TrainMemRepository trainMemRepository) {
        this.trainMemRepository = trainMemRepository;
    }

    // 훈련에 참가자 추가 로직
    public TrainMem addTrainMem(Train train, Person person) {
        // 이미 참가자가 있는지 확인
        if (trainMemRepository.findByTrainAndPerson(train, person) != null) {
            throw new IllegalArgumentException("This person is already added to the training.");
        }
        
        TrainMem trainMem = TrainMem.builder()
                .train(train)
                .person(person)
                .build();
        return trainMemRepository.save(trainMem);
    }
    
    // 이미 훈련에 참가자가 존재하는지 확인
    public boolean isPersonInTraining(Train train, Person person) {
        return trainMemRepository.findByTrainAndPerson(train, person) != null;
    }

    public void removeTrainMem(Train train, Person person) {
        TrainMem trainMem = trainMemRepository.findByTrainAndPerson(train, person);
        if (trainMem != null) {
            trainMemRepository.delete(trainMem);
        }
    }

    public List<TrainMem> getTrainMemsByTrain(Train train) {
        return trainMemRepository.findByTrain(train);
    }
}